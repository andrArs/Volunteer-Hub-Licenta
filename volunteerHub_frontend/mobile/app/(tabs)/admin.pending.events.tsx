import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View, StyleSheet } from "react-native";
import { getPendingEvents } from "@/src/api/admin.api";
import { EVENT_CATEGORIES, type EventResponse } from "@/src/types/event";

function categoryLabel(cat: number) {
  return EVENT_CATEGORIES.find((c) => c.value === cat)?.label ?? "Unknown";
}

function formatStart(dt: string) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export default function AdminPendingEventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setErr(null);
      setLoading(true);
      const data = await getPendingEvents();
      setEvents(data || []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load pending events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Pending Approvals</Text>
        <View style={styles.rightSpacer} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3F5E95" />
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
            <Text style={styles.foundText}>{events.length} event(s) awaiting review</Text>

            <FlatList
              data={events}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable 
                  style={styles.card} 
                  onPress={() => router.push(`/event.view?id=${item.id}`)}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={[styles.cardTitle, { flex: 1, marginBottom: 0 }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>PENDING</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <FontAwesome name="calendar" size={14} color="#3F5E95" />
                      <Text style={styles.metaText}>{formatStart(item.startDateTime)}</Text>
                    </View>
                  </View>

                  {/* <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <FontAwesome name="user" size={14} color="#3F5E95" />
                      <Text style={styles.metaText}>Created by: {item.createdById.substring(0, 8)}...</Text>
                    </View>
                  </View> */}
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={[styles.center, { marginTop: 40 }]}>
                  <FontAwesome name="check-circle" size={48} color="#D1FAE5" style={{ marginBottom: 16 }} />
                  <Text style={{ color: "#059669", fontWeight: "800", fontSize: 16 }}>
                    All caught up!
                  </Text>
                  <Text style={{ color: "#8B93A7", marginTop: 8 }}>
                    There are no pending events to review.
                  </Text>
                </View>
              }
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F4F6F9" },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16, backgroundColor: "#3F5E95", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  rightSpacer: { width: 44 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  foundText: { fontSize: 14, fontWeight: "700", color: "#8B93A7", marginBottom: 12 },
  listContent: { paddingBottom: 40 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#1E2A3B" },
  metaRow: { flexDirection: "row", marginTop: 8 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, fontWeight: "600", color: "#8B93A7" },
  pendingBadge: { backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  pendingBadgeText: { color: "#D97706", fontSize: 10, fontWeight: "800" },
  errorText: { color: "#DC2626", fontWeight: "600", marginBottom: 10 },
  retryBtn: { padding: 10, backgroundColor: "#3F5E95", borderRadius: 8 },
  retryText: { color: "#fff", fontWeight: "700" }
});