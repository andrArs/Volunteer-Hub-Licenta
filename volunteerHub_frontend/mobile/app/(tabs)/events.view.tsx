import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { getAllEvents } from "@/src/api/event.api";
import { EVENT_CATEGORIES, EventCategory, type EventResponse } from "@/src/types/event";
import { styles } from "@/src/styles/events.list.styles";
import * as Location from 'expo-location';
import { calculateDistance, formatDistance } from "@/src/utils/location.utils";
import { getAuth } from "@/src/store/auth.store";

type DistanceOption = { label: string; valueKm: number | null };
const DISTANCE_OPTIONS: DistanceOption[] = [
  { label: "Any", valueKm: null },
  { label: "< 1 km", valueKm: 1 },
  { label: "< 3 km", valueKm: 3 },
  { label: "< 5 km", valueKm: 5 },
  { label: "< 10 km", valueKm: 10 },
  { label: "< 20 km", valueKm: 20 },
  { label: "20+ km", valueKm: 999999 },
];

function categoryLabel(cat: EventCategory) {
  return EVENT_CATEGORIES.find((c) => c.value === cat)?.label ?? "Unknown";
}

function formatStart(dt: string) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} • ${hh}:${mi}`;
}

function renderMyEventBadge() {
  return (
    <View style={styles.badgeMyEvent}>
      <Text style={styles.textBadgeMyEvent}>
        MY EVENT
      </Text>
    </View>
  );
}

export default function AllEventsScreen() {
  const router = useRouter();
  const auth = getAuth();
  const myUserId = auth?.userId ?? null;

  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">("All");
  const [selectedDistance, setSelectedDistance] = useState<DistanceOption>(DISTANCE_OPTIONS[0]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDistanceModal, setShowDistanceModal] = useState(false);

  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    })();
  }, []);
  
  const load = useCallback(async () => {
    try {
      setErr(null);
      setLoading(true);
      const data = await getAllEvents();
      const now = new Date();
        const futureEvents = (data || []).filter(ev => {
          const eventDate = new Date(ev.startDateTime);
          return eventDate >= now;
        });

        setEvents(futureEvents);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return events.map((ev) => {
        let dist: number | null = null;
        if (userLocation && ev.latitude && ev.longitude) {
            dist = calculateDistance(userLocation.latitude, userLocation.longitude, ev.latitude, ev.longitude);
        }
        return { ...ev, distance: dist };
      })
      .filter((ev) => {
        const matchesQuery =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.locationName.toLowerCase().includes(q) ||
        ev.address.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "All" ? true : ev.category === selectedCategory;

    let matchesDistance = true;
        if (selectedDistance.valueKm !== null) {
            if (ev.distance === null) {
                matchesDistance = false;
            } else if (selectedDistance.valueKm === 999999) {
                matchesDistance = ev.distance >= 20; 
            } else {
                matchesDistance = ev.distance <= selectedDistance.valueKm;
            }
        }

      return matchesQuery && matchesCategory && matchesDistance;
    }).sort((a, b) => {
         if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
         if (a.distance !== null) return -1;
         if (b.distance !== null) return 1;
         return 0;
      });
  }, [events, query, selectedCategory, selectedDistance, userLocation]);

  const categoryChipText =
    selectedCategory === "All" ? "Category: All" : categoryLabel(selectedCategory);
  const distanceChipText = `Distance: ${selectedDistance.label}`;

  function openEvent(ev: EventResponse) {
    router.push(`/event.view?id=${ev.id}`)
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={18} color="#fff" />
            </Pressable>
        <Text style={styles.headerTitle}>All Events</Text>
        <View style={styles.rightSpacer} />
    
      </View>

      <View style={styles.filtersRow}>
        <Pressable
          style={styles.dropdown}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.dropdownText} numberOfLines={1}>
            {categoryChipText}
          </Text>
          <FontAwesome name="chevron-down" size={12} color="#3F5E95" />
        </Pressable>

        <Pressable
          style={styles.dropdown}
          onPress={() => setShowDistanceModal(true)}
        >
          <Text style={styles.dropdownText} numberOfLines={1}>
            {distanceChipText}
          </Text>
          <FontAwesome name="chevron-down" size={12} color="#3F5E95" />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <FontAwesome name="search" size={14} color="#8B93A7" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search event..."
          placeholderTextColor="#8B93A7"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : err ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{err}</Text>
            <Pressable onPress={load} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.foundText}>Found {filtered.length} events</Text>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Pressable style={styles.card} onPress={() => openEvent(item)}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={[styles.cardTitle, { flex: 1, marginBottom: 0 }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {item.status !== undefined && item.createdById === myUserId && renderMyEventBadge()}
                    
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <FontAwesome name="calendar" size={14} color="#3F5E95" />
                      <Text style={styles.metaText}>{formatStart(item.startDateTime)}</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <FontAwesome name="tag" size={14} color="#3F5E95" />
                      <Text style={styles.metaText}>{categoryLabel(item.category)}</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <FontAwesome name="map-marker" size={14} color="#3F5E95" />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {item.locationName || item.address || "No location"}
                      </Text>
                    </View>
                  </View>

                  {item.distance !== null && item.distance !== undefined && (
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <FontAwesome name="location-arrow" size={13} color="#3F5E95" />
                        <Text style={[styles.metaText, { color: '#3F5E95', fontWeight: '700' }]}>
                          {formatDistance(item.distance)}
                        </Text>
                      </View>
                    </View>
                  )}

                </Pressable>
              )}
            />
          </>
        )}
      </View>

      <Pressable
        style={styles.mapButton}
        onPress={() => router.push("/events.map")}
      >
        <FontAwesome name="map" size={16} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '800', marginLeft: 10, fontSize: 16 }}>
          Map View
        </Text>
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={showCategoryModal}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryModal(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Category</Text>
              <Pressable onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.optionRow}
              onPress={() => {
                setSelectedCategory("All");
                setShowCategoryModal(false);
              }}
            >
              <Text style={styles.optionText}>All</Text>
            </Pressable>

            {EVENT_CATEGORIES.map((c) => (
              <Pressable
                key={String(c.value)}
                style={styles.optionRow}
                onPress={() => {
                  setSelectedCategory(c.value);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.optionText}>{c.label}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={showDistanceModal}
        onRequestClose={() => setShowDistanceModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDistanceModal(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Distance</Text>
              <Pressable onPress={() => setShowDistanceModal(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </Pressable>
            </View>

            {DISTANCE_OPTIONS.map((d) => (
              <Pressable
                key={d.label}
                style={styles.optionRow}
                onPress={() => {
                  setSelectedDistance(d);
                  setShowDistanceModal(false);
                }}
              >
                <Text style={styles.optionText}>{d.label}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
