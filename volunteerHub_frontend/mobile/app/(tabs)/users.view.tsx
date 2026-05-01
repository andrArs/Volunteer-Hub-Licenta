import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { styles } from "@/src/styles/events.list.styles";
import { getAuth } from "@/src/store/auth.store";
import { getAllUsers } from "@/src/api/user.api";
import { UserProfile } from "@/src/types/user";


export default function AllUsersScreen() {
  const router = useRouter();
  const auth = getAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const pageRef = useRef(1);

  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    try {
      setErr(null);
      setLoading(true);
      pageRef.current = 1;
      const result = await getAllUsers(1, 10);
      setUsers(result.items);
      setHasNextPage(result.hasNextPage);
      setTotalCount(result.totalCount);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

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
                onPress={() => router.back()}
                hitSlop={10}
                style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={18} color="#fff" />
            </Pressable>
        <Text style={styles.headerTitle}>All Users</Text>
        <View style={styles.rightSpacer} />
    
      </View>
         
      <View style={[styles.searchWrap, styles.searchWrapMargin]}>
        <FontAwesome name="search" size={14} color="#8B93A7" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search users..."
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
          <Text style={styles.foundText}>Showing {filteredUsers.length} of {totalCount} users</Text>
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
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
                    <Text style={styles.rolesLabel}>Roles:</Text>
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
