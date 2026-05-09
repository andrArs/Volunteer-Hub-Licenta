import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { goBack } from "@/src/utils/navigation";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { getPendingEvents } from "@/src/api/admin.api";
import { EVENT_CATEGORIES, type EventResponse } from "@/src/types/event";
import { styles } from "@/src/styles/events.pending";
import { t, useLanguage } from "@/src/i18n/index";

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
  useLanguage();
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      setErr(null);
      if (!isRefresh) setLoading(true);
      const data = await getPendingEvents();
      setEvents(data || []);
    } catch (e: any) {
      setErr(e?.message ?? t("adminPending.failedToLoad"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

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
        <Text style={styles.headerTitle}>{t("adminPending.title")}</Text>
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
            <Pressable onPress={() => load()} style={styles.retryBtn}>
              <Text style={styles.retryText}>{t("common.retry")}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.foundText}>
              {events.length === 1
                ? t("adminPending.awaitingSingular")
                : t("adminPending.awaitingPlural", { count: events.length })}
            </Text>

            <FlatList
              data={events}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3F5E95"]} tintColor="#3F5E95" />}
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
                        <Text style={styles.pendingBadgeText}>{t("adminPending.pending")}</Text>
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
                    {t("adminPending.allCaughtUp")}
                  </Text>
                  <Text style={{ color: "#8B93A7", marginTop: 8 }}>
                    {t("adminPending.noPending")}
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