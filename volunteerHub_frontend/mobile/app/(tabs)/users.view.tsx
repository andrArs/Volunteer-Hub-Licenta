import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { goBack } from "@/src/utils/navigation";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { styles } from "@/src/styles/events.list.styles";
import { getAuth } from "@/src/store/auth.store";
import { getAllUsers } from "@/src/api/user.api";
import { UserProfile } from "@/src/types/user";
import { t, useLanguage } from "@/src/i18n/index";


export default function AllUsersScreen() {
  const router = useRouter();
  const auth = getAuth();
  useLanguage();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const pageRef = useRef(1);

  const [query, setQuery] = useState("");

  const load = useCallback(async (isRefresh = false) => {
    try {
      setErr(null);
      if (!isRefresh) setLoading(true);
      pageRef.current = 1;
      const result = await getAllUsers(1, 10);
      setUsers(result.items);
      setHasNextPage(result.hasNextPage);
      setTotalCount(result.totalCount);
    } catch (e: any) {
      setErr(e?.message ?? t("usersView.failedToLoad"));
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
      const result = await getAllUsers(nextPage, 10);
      setUsers(prev => [...prev, ...result.items]);
      setHasNextPage(result.hasNextPage);
      pageRef.current = nextPage;
    } catch {
      Alert.alert(t("common.error"), t("usersView.failedToLoad"));
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasNextPage]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => 
      (u.firstName?.toLowerCase().includes(q)) ||
      (u.lastName?.toLowerCase().includes(q)) ||
      (u.email?.toLowerCase().includes(q))
    );
  }, [users, query]);

  function openUserProfile(user: UserProfile) {
     router.push(`/user.view?id=${user.id}`)
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable
                onPress={() => goBack()}
                hitSlop={10}
                style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={18} color="#fff" />
            </Pressable>
        <Text style={styles.headerTitle}>{t("usersView.title")}</Text>
        <View style={styles.rightSpacer} />
    
      </View>
         
      <View style={[styles.searchWrap, styles.searchWrapMargin]}>
        <FontAwesome name="search" size={14} color="#8B93A7" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("usersView.searchPlaceholder")}
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
            <Pressable onPress={() => load()} style={styles.retryBtn}>
              <Text style={styles.retryText}>{t("common.retry")}</Text>
            </Pressable>
          </View>
        ) : (
          <>
          <Text style={styles.foundText}>{t("usersView.showing", { showing: filteredUsers.length, total: totalCount })}</Text>
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3F5E95"]} tintColor="#3F5E95" />}
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.listFooter}>
                    <ActivityIndicator size="small" />
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <Pressable style={styles.card} onPress={() => openUserProfile(item)}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.cardTitle, styles.cardTitleInRow]} numberOfLines={1}>
                      {item.firstName} {item.lastName}
                    </Text>
                  </View>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaText} >
                        {item.email}
                      </Text>
                    </View>
                </View>

                {item.roles && item.roles.length > 0 && (
                  <View style={styles.rolesRow}>
                    <Text style={styles.rolesLabel}>{t("usersView.roles")}</Text>
                    {item.roles.map(role => (
                      <View
                        key={role}
                        style={role === 'Admin' ? styles.roleBadgeAdmin : styles.roleBadge}
                      >
                        <Text style={role === 'Admin' ? styles.roleBadgeTextAdmin : styles.roleBadgeText}>
                          {role}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                </Pressable>
              )}
            />
          </>
        )}
      </View>
    </View>
  );
}
