import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { goBack } from "@/src/utils/navigation";
import React, { useCallback, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { getMyCreatedEvents, getMyAttendanceEvents } from "@/src/api/event.api";
import { getAuth, logout } from "@/src/store/auth.store";
import { type EventResponse } from "@/src/types/event";
import { styles } from "@/src/styles/profile.styles";
import { getMyProfile, uploadProfilePicture, removeProfilePicture } from "@/src/api/user.api";
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
  const diffDays = Math.ceil((evDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

export default function MyProfileScreen() {
  const router = useRouter();
  const auth = getAuth();
  const userEmail = auth?.email || "";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [stats, setStats] = useState({ attended: 0, organized: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<EventResponse[]>([]);
  const [profileInfo, setProfileInfo] = useState<UserProfile | null>(null);

  const loadProfileData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const [created, history, going, myProfile] = await Promise.all([
        getMyCreatedEvents(),
        getMyAttendanceEvents("history"),
        getMyAttendanceEvents("going"),
        getMyProfile(),
      ]);

      const now = new Date();
      const upcoming = (going || []).filter((ev) => new Date(ev.startDateTime) >= now);

      setStats({ attended: history.length, organized: created.length });
      setProfileInfo(myProfile);
      setUpcomingEvents(
        upcoming
          .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
          .slice(0, 5)
      );
    } catch (error) {
      console.error("Failed to load profile data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfileData(true);
  }, [loadProfileData]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  async function openImagePicker() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    try {
      setUploading(true);
      const url = await uploadProfilePicture(asset.uri, asset.mimeType ?? undefined);
      setProfileInfo((prev) => (prev ? { ...prev, profilePictureUrl: url } : prev));
    } catch {
      Alert.alert("Error", "Could not upload picture. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    try {
      setUploading(true);
      await removeProfilePicture();
      setProfileInfo((prev) => (prev ? { ...prev, profilePictureUrl: undefined } : prev));
    } catch {
      Alert.alert("Error", "Could not remove picture. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleAvatarPress() {
    if (uploading) return;

    if (Platform.OS === "ios") {
      const hasPhoto = !!profileInfo?.profilePictureUrl;
      const options = [
        ...(hasPhoto ? ["View Photo"] : []),
        "Change Photo",
        ...(hasPhoto ? ["Remove Photo"] : []),
        "Cancel",
      ];
      const cancelIndex = options.length - 1;
      const destructiveIndex = hasPhoto ? options.indexOf("Remove Photo") : -1;

      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIndex, destructiveButtonIndex: destructiveIndex },
        (index) => {
          if (hasPhoto && index === options.indexOf("View Photo")) {
            setShowPhotoModal(true);
          } else if (index === options.indexOf("Change Photo")) {
            openImagePicker();
          } else if (hasPhoto && index === options.indexOf("Remove Photo")) {
            handleRemovePhoto();
          }
        }
      );
    } else {
      setShowOptionsSheet(true);
    }
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack()} hitSlop={10} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Pressable onPress={() => router.push("/profile.update")} style={styles.editBtn}>
          <FontAwesome name="pencil" size={18} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3F5E95"]} tintColor="#3F5E95" />}>
        {loading ? (
          <ActivityIndicator size="large" color="#3F5E95" style={styles.loadingIndicator} />
        ) : (
          <>
            <View style={styles.userCard}>
              <View style={styles.avatarContainer}>
                <Pressable onPress={handleAvatarPress} style={styles.avatarCircleWrap}>
                  {profileInfo?.profilePictureUrl ? (
                    <Image
                      source={{ uri: profileInfo.profilePictureUrl }}
                      style={styles.avatarCircleImage}
                    />
                  ) : (
                    <View style={styles.avatarCircle}>
                      <FontAwesome name="user" size={32} color="#3F5E95" />
                    </View>
                  )}
                  <View style={styles.cameraOverlay}>
                    {uploading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <FontAwesome name="camera" size={11} color="#fff" />
                    )}
                  </View>
                </Pressable>

                <Text style={styles.avatarName}>
                  {profileInfo?.firstName} {profileInfo?.lastName}
                </Text>
              </View>

              <View style={styles.userDetailsBox}>
                <View style={styles.userDetailRow}>
                  <Text style={styles.userDetailLabel}>First Name</Text>
                  <Text style={styles.userDetailValue}>{profileInfo?.firstName || "."}</Text>
                </View>
                <View style={styles.userDetailRow}>
                  <Text style={styles.userDetailLabel}>Last Name</Text>
                  <Text style={styles.userDetailValue}>{profileInfo?.lastName || "."}</Text>
                </View>
                <View style={profileInfo?.dateOfBirth ? styles.userDetailRow : styles.userDetailRowLast}>
                  <Text style={styles.userDetailLabel}>Email</Text>
                  <Text style={styles.userDetailValue}>{userEmail || "."}</Text>
                </View>
                {profileInfo?.dateOfBirth && (
                  <View style={styles.userDetailRowLast}>
                    <Text style={styles.userDetailLabel}>Date of Birth</Text>
                    <Text style={styles.userDetailValue}>
                      {calculateAge(profileInfo.dateOfBirth)} years old ({formatDateOnly(profileInfo.dateOfBirth)})
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={[styles.card, styles.statsCard]}>
              <Pressable style={styles.statBox} onPress={() => router.push("/my.events")}>
                <Text style={styles.statNumber}>{stats.attended}</Text>
                <Text style={styles.statLabel}>Events{"\n"}Attended</Text>
              </Pressable>
              <View style={styles.statDivider} />
              <Pressable style={styles.statBox} onPress={() => router.push("/my.events")}>
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
                    <View
                      key={ev.id}
                      style={[
                        styles.reminderItem,
                        index !== upcomingEvents.length - 1 && styles.reminderBorder,
                      ]}
                    >
                      <View style={styles.reminderIconBox}>
                        <FontAwesome name="calendar-check-o" size={18} color="#3F5E95" />
                      </View>
                      <View style={styles.reminderTextWrap}>
                        <Text style={styles.reminderTitle} numberOfLines={1}>
                          {ev.title}
                        </Text>
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

      <Modal visible={showPhotoModal} transparent animationType="fade">
        <Pressable style={styles.photoModalOverlay} onPress={() => setShowPhotoModal(false)}>
          <Image
            source={{ uri: profileInfo?.profilePictureUrl }}
            style={styles.photoModalImage}
          />
        </Pressable>
      </Modal>

      <Modal visible={showOptionsSheet} transparent animationType="fade">
        <Pressable style={styles.optionsOverlay} onPress={() => setShowOptionsSheet(false)}>
          <View style={styles.optionsSheet}>
            {profileInfo?.profilePictureUrl && (
              <>
                <Pressable
                  style={styles.optionsBtn}
                  onPress={() => {
                    setShowOptionsSheet(false);
                    setTimeout(() => setShowPhotoModal(true), 300);
                  }}
                >
                  <Text style={styles.optionsBtnText}>View Photo</Text>
                </Pressable>
                <View style={styles.optionsDivider} />
              </>
            )}
            <Pressable
              style={styles.optionsBtn}
              onPress={async () => {
                if (Platform.OS !== "web") {
                  const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (!granted) {
                    setShowOptionsSheet(false);
                    setTimeout(() => Alert.alert("Permission needed", "Please allow access to your photo library."), 300);
                    return;
                  }
                }
                setShowOptionsSheet(false);
                setTimeout(() => openImagePicker(), 500);
              }}
            >
              <Text style={styles.optionsBtnText}>Change Photo</Text>
            </Pressable>
            {profileInfo?.profilePictureUrl && (
              <>
                <View style={styles.optionsDivider} />
                <Pressable
                  style={styles.optionsBtn}
                  onPress={() => {
                    setShowOptionsSheet(false);
                    handleRemovePhoto();
                  }}
                >
                  <Text style={styles.optionsRemoveText}>Remove Photo</Text>
                </Pressable>
              </>
            )}
            <View style={styles.optionsDivider} />
            <Pressable style={styles.optionsBtn} onPress={() => setShowOptionsSheet(false)}>
              <Text style={styles.optionsCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
