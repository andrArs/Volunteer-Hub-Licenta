import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { goBack } from "@/src/utils/navigation";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View, StyleSheet } from "react-native";
import { getPendingEvents } from "@/src/api/admin.api";
import { EVENT_CATEGORIES, type EventResponse } from "@/src/types/event";
import { styles } from "@/src/styles/events.pending";

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
        <Pressable onPress={() => goBack()} hitSlop={10} style={styles.backBtn}>
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

                  {(item.creatorName || item.creatorEmail) && (
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <FontAwesome name="user" size={14} color="#3F5E95" />
                        <Text style={styles.metaText}>
                          {item.creatorName}{item.creatorEmail ? ` - ${item.creatorEmail}` : ""}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <FontAwesome name="calendar" size={14} color="#3F5E95" />
                      <Text style={styles.metaText}>{formatStart(item.startDateTime)}</Text>
                    </View>
                  </View>

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