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
import { styles } from "@/src/styles/events.list.styles";
import { getAuth } from "@/src/store/auth.store";
import { getAllUsers } from "@/src/api/user.api";
import { UserProfile } from "@/src/types/user";


export default function AllUsersScreen() {
  const router = useRouter();
  const auth = getAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  
  const load = useCallback(async () => {
    try {
      setErr(null);
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);

    } catch (e: any) {
      setErr(e?.message ?? "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );


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
         
      {/* <View style={styles.searchWrap}>
        <FontAwesome name="search" size={14} color="#8B93A7" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search users..."
          placeholderTextColor="#8B93A7"
          style={styles.searchInput}
        />
      </View> */}

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
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Pressable style={styles.card} onPress={() => openUserProfile(item)}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={[styles.cardTitle, { flex: 1, marginBottom: 0 }]} numberOfLines={1}>
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#8B93A7' }}>
                      Roles:
                    </Text>

                    {item.roles.map(role => (
                      <View 
                        key={role} 
                        style={{
                          backgroundColor: role === 'Admin' ? '#FEE2E2' : '#E9EEF9',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8
                        }}
                      >
                        <Text style={{
                          color: role === 'Admin' ? '#DC2626' : '#3F5E95',
                          fontSize: 11,
                          fontWeight: '800'
                        }}>
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
