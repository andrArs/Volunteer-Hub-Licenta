import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { goBack } from "@/src/utils/navigation";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { getNotifications, markAllAsRead, markAsRead } from "@/src/api/notification.api";
import type { Notification } from "@/src/types/notification";
import { styles } from "@/src/styles/notification.styles";

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pageRef = useRef(1);

  const load = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (!isRefresh) setLoading(true);
      pageRef.current = 1;
      const result = await getNotifications(1, 10);
      setNotifications(result.items);
      setHasNextPage(result.hasNextPage);
    } catch {
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNextPage) return;
    try {
      setLoadingMore(true);
      const nextPage = pageRef.current + 1;
      const result = await getNotifications(nextPage, 10);
      setNotifications(prev => [...prev, ...result.items]);
      setHasNextPage(result.hasNextPage);
      pageRef.current = nextPage;
    } catch {
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasNextPage]);

  useFocusEffect(
    useCallback(() => {
      load();
      const interval = setInterval(load, 30000);
      return () => clearInterval(interval);
    }, [load])
  );

  async function handlePress(item: Notification) {
    if (markingId) return;

    if (!item.isRead) {
      setMarkingId(item.id);
      try {
        await markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      } catch {
      } finally {
        setMarkingId(null);
      }
    }

    if (item.eventId) {
      router.push(`/event.view?id=${item.eventId}`);
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleMarkAll() {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack()} hitSlop={10} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.rightSpacer} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3F5E95" />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <FontAwesome name="exclamation-circle" size={40} color="#DC2626" style={styles.iconMarginBottom12} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => load()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {unreadCount > 0 && (
              <View style={styles.unreadHeaderRow}>
                <Text style={styles.unreadLabel}>
                  {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
                </Text>
                <Pressable onPress={handleMarkAll} disabled={markingAll} hitSlop={8}>
                  <Text style={[styles.markAllText, markingAll && styles.markAllDisabled]}>
                    {markingAll ? "Marking..." : "Mark all as read"}
                  </Text>
                </Pressable>
              </View>
            )}

            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3F5E95"]} tintColor="#3F5E95" />}
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.listFooter}>
                    <ActivityIndicator size="small" color="#3F5E95" />
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.card, !item.isRead && styles.cardUnread]}
                  onPress={() => handlePress(item)}
                  disabled={markingId === item.id}
                >
                  <View style={styles.cardRow}>
                    <View style={styles.iconWrap}>
                      <FontAwesome
                        name={item.isRead ? "bell-o" : "bell"}
                        size={16}
                        color={item.isRead ? "#8B93A7" : "#3F5E95"}
                      />
                    </View>

                    <View style={styles.cardBody}>
                      <Text style={[styles.message, !item.isRead && styles.messageUnread]}>
                        {item.message}
                      </Text>
                      <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
                    </View>

                    {item.eventId ? (
                      markingId === item.id ? (
                        <ActivityIndicator size="small" color="#3F5E95" />
                      ) : (
                        <FontAwesome name="chevron-right" size={12} color="#C9D1E2" />
                      )
                    ) : null}
                  </View>

                  {!item.isRead && <View style={styles.unreadDot} />}
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={[styles.center, styles.emptyWrap]}>
                  <FontAwesome name="bell-o" size={48} color="#D1D5E0" style={styles.iconMarginBottom16} />
                  <Text style={styles.emptyTitle}>No notifications yet</Text>
                  <Text style={styles.emptySubtitle}>
                    You'll be notified when your events are reviewed.
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
