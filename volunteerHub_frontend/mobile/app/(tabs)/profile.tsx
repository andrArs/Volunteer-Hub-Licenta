import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View, Alert } from "react-native";

import { getMyCreatedEvents, getMyAttendanceEvents } from "@/src/api/event.api";
import { getAuth, logout } from "@/src/store/auth.store"; 
import { type EventResponse } from "@/src/types/event";
import { styles } from "@/src/styles/profile.styles";
import { getMyProfile } from "@/src/api/user.api";
import { UserProfile } from "@/src/types/user";

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

function formatDateOnly(dt: string) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`; 
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

function calculateAge(dob?: string | null): number | string {
  if (!dob) return "N/A";
  
  const birthDate = new Date(dob);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export default function MyProfileScreen() {
  const router = useRouter();
  const auth = getAuth(); 
  
  const userEmail = auth?.email || "test@yahoo.com";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ attended: 0, organized: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<EventResponse[]>([]);
  const [profileInfo, setProfileInfo] = useState<UserProfile | null>(null);

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const [created, history, going, myProfile] = await Promise.all([
        getMyCreatedEvents(),
        getMyAttendanceEvents("history"),
        getMyAttendanceEvents("going"),
        getMyProfile()
      ]);

      
      const now = new Date();
      const upcoming = (going || []).filter(ev => {
      const eventDate = new Date(ev.startDateTime);
      return eventDate >= now;});

      setStats({
        attended: history.length, 
        organized: created.length 
      });
      setProfileInfo(myProfile);

      const sortedUpcoming = upcoming
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
                <Text style={styles.infoTextBold}>
                  {profileInfo?.firstName} {profileInfo?.lastName} 
                  </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <FontAwesome name="envelope" size={16} color="#3F5E95" style={styles.infoIcon} />
                <Text style={styles.infoText}>{userEmail}</Text>
              </View>
              {profileInfo?.dateOfBirth && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <FontAwesome name="birthday-cake" size={16} color="#3F5E95" style={styles.infoIcon} />
                    <Text style={styles.infoText}>
                      {calculateAge(profileInfo.dateOfBirth)} years old ({formatDateOnly(profileInfo.dateOfBirth)})
                    </Text>
                  </View>
                </>
              )}
            </View>

            <View style={[styles.card, styles.statsCard]}>
              <Pressable style={styles.statBox} 
                onPress={() => router.push("/my.events")}>
                <Text style={styles.statNumber}>{stats.attended}</Text>
                <Text style={styles.statLabel}>Events{"\n"}Attended</Text>
              </Pressable>
              <View style={styles.statDivider} />
              <Pressable style={styles.statBox} 
                onPress={() => router.push("/my.events")}>
                <Text style={styles.statNumber}>{stats.organized}</Text>
                <Text style={styles.statLabel}>Events{"\n"}Organized</Text>
              </Pressable>
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