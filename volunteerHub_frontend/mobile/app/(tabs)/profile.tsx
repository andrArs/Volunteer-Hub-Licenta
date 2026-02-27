import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View, Alert } from "react-native";

import { getMyCreatedEvents, getMyAttendanceEvents } from "@/src/api/event.api";
import { getAuth, logout } from "@/src/store/auth.store"; 
import { type EventResponse } from "@/src/types/event";
import { styles } from "@/src/styles/profile.styles";

function formatDateTime(dt: string) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} at ${hh}:${mi}`;
}

function getReminderPill(dateString: string) {
  const evDate = new Date(dateString);
  const today = new Date();
  
  evDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = evDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: "Today", bg: "#F05A4A" }; 
  if (diffDays === 1) return { label: "Tomorrow", bg: "#F8A01A" }; 
  return { label: `${diffDays} days`, bg: "#3F5E95" }; 
}

export default function MyProfileScreen() {
  const router = useRouter();
  const auth = getAuth(); 
  
  const userName = auth?.username || "Test User";
  const userEmail = auth?.email || "test@yahoo.com";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ attended: 0, organized: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<EventResponse[]>([]);

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const [created, history, going] = await Promise.all([
        getMyCreatedEvents(),
        getMyAttendanceEvents("history"),
        getMyAttendanceEvents("going")
      ]);

      setStats({
        attended: history.length, 
        organized: created.length 
      });

      const sortedUpcoming = going
        .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
        .slice(0, 5);

      setUpcomingEvents(sortedUpcoming);

    } catch (error) {
      console.error("Failed to load profile data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  
  async function handleLogout() {
        await logout();
        router.replace("/(auth)/login");
  }
  

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.rightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {loading ? (
          <ActivityIndicator size="large" color="#3F5E95" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <FontAwesome name="user" size={18} color="#3F5E95" style={styles.infoIcon} />
                <Text style={styles.infoTextBold}>{userName}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <FontAwesome name="envelope" size={16} color="#3F5E95" style={styles.infoIcon} />
                <Text style={styles.infoText}>{userEmail}</Text>
              </View>
            </View>

            <View style={[styles.card, styles.statsCard]}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.attended}</Text>
                <Text style={styles.statLabel}>Events{"\n"}Attended</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.organized}</Text>
                <Text style={styles.statLabel}>Events{"\n"}Organized</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Upcoming Event Reminders</Text>
              <View style={styles.divider} />

              {upcomingEvents.length === 0 ? (
                <Text style={styles.emptyText}>No upcoming events. Go find some!</Text>
              ) : (
                upcomingEvents.map((ev, index) => {
                  const pill = getReminderPill(ev.startDateTime);
                  return (
                    <View key={ev.id} style={[styles.reminderItem, index !== upcomingEvents.length - 1 && styles.reminderBorder]}>
                      <View style={styles.reminderIconBox}>
                        <FontAwesome name="calendar-check-o" size={18} color="#3F5E95" />
                      </View>
                      
                      <View style={styles.reminderTextWrap}>
                        <Text style={styles.reminderTitle} numberOfLines={1}>{ev.title}</Text>
                        <Text style={styles.reminderDate}>{formatDateTime(ev.startDateTime)}</Text>
                      </View>

                      <View style={[styles.pill, { backgroundColor: pill.bg }]}>
                        <Text style={styles.pillText}>{pill.label}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

    </View>
  );
}