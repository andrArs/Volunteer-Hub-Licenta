import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
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

export default function AllEventsScreen() {
  const router = useRouter();

  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">("All");
  const [selectedDistance, setSelectedDistance] = useState<DistanceOption>(DISTANCE_OPTIONS[0]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDistanceModal, setShowDistanceModal] = useState(false);

  const load = useCallback(async () => {
    try {
      setErr(null);
      setLoading(true);
      const data = await getAllEvents();
      setEvents(data ?? []);
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

    return events.filter((ev) => {
      const matchesQuery =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.locationName.toLowerCase().includes(q) ||
        ev.address.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "All" ? true : ev.category === selectedCategory;

    //to be implemeted
      const matchesDistance = true;

      return matchesQuery && matchesCategory && matchesDistance;
    });
  }, [events, query, selectedCategory, selectedDistance]);

  const categoryChipText =
    selectedCategory === "All" ? "Category: All" : categoryLabel(selectedCategory);
  const distanceChipText = `Distance: ${selectedDistance.label}`;

  function openEvent(ev: EventResponse) {
    router.push(`/event.update?id=${ev.id}`)
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Events</Text>
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
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>

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
                        {item.address}
                      </Text>
                      <Text style={styles.metaText} numberOfLines={1}>
                        {/* to be implemented */}
                        ... km away
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )}
            />
          </>
        )}
      </View>

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
