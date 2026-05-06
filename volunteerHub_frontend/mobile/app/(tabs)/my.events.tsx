import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { goBack } from "@/src/utils/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { getMyCreatedEvents, getMyAttendanceEvents } from "@/src/api/event.api";
import { EVENT_CATEGORIES, EventCategory, EventStatus, type EventResponse } from "@/src/types/event";
import { styles } from "@/src/styles/events.list.styles";
import { t, useLanguage } from "@/src/i18n/index";
import * as Location from 'expo-location';
import { calculateDistance, formatDistance } from "@/src/utils/location.utils";

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

type TabType = "Interested" | "Going" | "Created" | "History";
const TABS: TabType[] = ["Interested", "Going", "Created", "History"];

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

function renderStatusBadge(rawStatus: EventStatus | string | number) {
  const status = Number(rawStatus);

  let bgColor = "#E5E7EB"; 
  let textColor = "#374151";
  let label = t("myEvents.statusUnknown");

  if (status === EventStatus.Pending) {
    bgColor = "#FEF3C7";
    textColor = "#D97706";
    label = t("myEvents.statusPending");
  } else if (status === EventStatus.Approved) {
    bgColor = "#D1FAE5";
    textColor = "#059669";
    label = t("myEvents.statusApproved");
  } else if (status === EventStatus.Rejected) {
    bgColor = "#FEE2E2";
    textColor = "#DC2626";
    label = t("myEvents.statusRejected");
  }

  return (
    <View style={{
      backgroundColor: bgColor,
      ...styles.badge
    }}>
      <Text style={{ color: textColor, fontSize: 11, fontWeight: '800' }}>
        {label}
      </Text>
    </View>
  );
}

export default function MyEventsScreen() {
  const router = useRouter();
  useLanguage();

  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>("Going");

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">("All");
  const [selectedDistance, setSelectedDistance] = useState<DistanceOption>(DISTANCE_OPTIONS[0]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDistanceModal, setShowDistanceModal] = useState(false);

  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      setErr(null);
      if (!isRefresh) setLoading(true);

      let data: EventResponse[] = [];

      if (activeTab === "Created") {
        data = await getMyCreatedEvents();
      } else if (activeTab === "History") {
        const rawData = await getMyAttendanceEvents("history");
        const now = new Date();
        data = (rawData || []).filter(ev => {
          const eventDate = new Date(ev.startDateTime);
          return eventDate < now;
        });
      } else if (activeTab === "Going") {
        const rawData = await getMyAttendanceEvents("going");
        const now = new Date();
        data = (rawData || []).filter(ev => {
          const eventDate = new Date(ev.startDateTime);
          return eventDate >= now;
        });
      } else if (activeTab === "Interested") {
        const rawData = await getMyAttendanceEvents("interested");
        const now = new Date();
        data = (rawData || []).filter(ev => {
          const eventDate = new Date(ev.startDateTime);
          return eventDate >= now;
        });
      }

      setEvents(data ?? []);
    } catch (e: any) {
      setErr(e?.message ?? t("myEvents.failedToLoad"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]); 

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      } catch {
      }
    })();
  }, []);

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
        (ev.locationName && ev.locationName.toLowerCase().includes(q)) ||
        (ev.address && ev.address.toLowerCase().includes(q));

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
    })
    .sort((a, b) => {
         if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
         if (a.distance !== null) return -1;
         if (b.distance !== null) return 1;
         return 0;
      });
  }, [events, query, selectedCategory, selectedDistance, userLocation]);

  function getTabLabel(tab: TabType) {
    const map: Record<TabType, string> = {
      Interested: t("myEvents.tabInterested"),
      Going: t("myEvents.tabGoing"),
      Created: t("myEvents.tabCreated"),
      History: t("myEvents.tabHistory"),
    };
    return map[tab];
  }

  const distAnyLabel = t("myEvents.distAny");
  const categoryChipText = selectedCategory === "All"
    ? `${t("myEvents.catPrefix")}: ${t("myEvents.filterAll")}`
    : `${t("myEvents.catPrefix")}: ${categoryLabel(selectedCategory)}`;
  const distanceChipText = `${t("myEvents.distPrefix")}: ${selectedDistance.valueKm === null ? distAnyLabel : selectedDistance.label}`;

  function openEvent(ev: EventResponse) {
    router.push(`/event.view?id=${ev.id}`);
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack()} hitSlop={10} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{t("myEvents.title")}</Text>
        <View style={styles.rightSpacer} />
      </View>

      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {getTabLabel(tab)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.filtersRow}>
        <Pressable style={styles.dropdown} onPress={() => setShowCategoryModal(true)}>
          <Text style={styles.dropdownText} numberOfLines={1}>
            {categoryChipText}
          </Text>
          <FontAwesome name="chevron-down" size={12} color="#3F5E95" />
        </Pressable>

        <Pressable style={styles.dropdown} onPress={() => setShowDistanceModal(true)}>
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
          placeholder={t("myEvents.searchPlaceholder")}
          placeholderTextColor="#8B93A7"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#3F5E95" size="large" />
          </View>
        ) : err ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{err}</Text>
            <Pressable onPress={() => load()} style={styles.retryBtn}>
              <Text style={styles.retryText}>{t("common.retry")}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.foundText}>
              {filtered.length === 1
                ? t("myEvents.foundSingular")
                : t("myEvents.foundPlural", { count: filtered.length })}
            </Text>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3F5E95"]} tintColor="#3F5E95" />}
              renderItem={({ item }) => (
                <Pressable style={styles.card} onPress={() => openEvent(item)}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.cardTitle, styles.cardTitleInRow]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {activeTab === "Created" && item.status !== undefined && renderStatusBadge(item.status)}
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
                        {item.locationName}
                      </Text>
                    </View>
                  </View>

                   {item.distance !== null && item.distance !== undefined && (
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <FontAwesome name="location-arrow" size={13} color="#3F5E95" />
                      <Text style={[styles.metaText, styles.metaTextHighlight]}>
                       {formatDistance(item.distance)}
                    </Text>
                    </View>
                    </View>
                    )}
                  
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={[styles.center, styles.centerWithTopMargin]}>
                  <Text style={styles.emptyText}>{t("myEvents.noEvents")}</Text>
                </View>
              }
            />
          </>
        )}
      </View>

      <Modal transparent animationType="fade" visible={showCategoryModal} onRequestClose={() => setShowCategoryModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryModal(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("myEvents.filterCategory")}</Text>
              <Pressable onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalClose}>{t("common.close")}</Text>
              </Pressable>
            </View>

            <Pressable style={styles.optionRow} onPress={() => { setSelectedCategory("All"); setShowCategoryModal(false); }}>
              <Text style={styles.optionText}>{t("myEvents.filterAll")}</Text>
            </Pressable>

            {EVENT_CATEGORIES.map((c) => (
              <Pressable key={String(c.value)} style={styles.optionRow} onPress={() => { setSelectedCategory(c.value); setShowCategoryModal(false); }}>
                <Text style={styles.optionText}>{c.label}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent animationType="fade" visible={showDistanceModal} onRequestClose={() => setShowDistanceModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowDistanceModal(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("myEvents.filterDistance")}</Text>
              <Pressable onPress={() => setShowDistanceModal(false)}>
                <Text style={styles.modalClose}>{t("common.close")}</Text>
              </Pressable>
            </View>

            {DISTANCE_OPTIONS.map((d) => (
              <Pressable key={d.label} style={styles.optionRow} onPress={() => { setSelectedDistance(d); setShowDistanceModal(false); }}>
                <Text style={styles.optionText}>{d.valueKm === null ? t("myEvents.distAny") : d.label}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}