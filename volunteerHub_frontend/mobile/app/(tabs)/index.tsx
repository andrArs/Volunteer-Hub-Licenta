import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useCallback, useState } from "react";
import { styles } from "@/src/styles/home.styles";
import { getAuth, logout } from "@/src/store/auth.store";
import { getNotifications } from "@/src/api/notification.api";


export default function HomeScreen() {
  const router = useRouter();
  const [aiText, setAiText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const auth = getAuth();
  const isAdmin = auth?.roles?.includes("Admin") ?? false;

  useFocusEffect(
    useCallback(() => {
      getNotifications()
        .then((data) => setUnreadCount(data.filter((n) => !n.isRead).length))
        .catch(() => setUnreadCount(0));
    }, [])
  );

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome to{"\n \n"}Volunteer Hub</Text>
        <Pressable
          style={bellStyles.btn}
          onPress={() => router.push("/notifications")}
          hitSlop={10}
        >
          <FontAwesome name="bell" size={20} color="#fff" />
          {unreadCount > 0 && (
            <View style={bellStyles.badge}>
              <Text style={bellStyles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.grid}>

          {isAdmin && (
            <HomeCard
              title="Manage Events"
              icon="shield" 
              onPress={() => router.push("/admin.pending.events")}
            />
          )}

          {isAdmin && (
            <HomeCard
              title="Manage Users"
              icon="users" 
              onPress={() => router.push("/users.view")}
            />
          )}

          <HomeCard
            title="My Events"
            icon="calendar"
            onPress={() => router.push("/my.events")}
          />
          <HomeCard
            title="View Events"
            icon="search"
            onPress={() => router.push("/events.view")}
          />

          <HomeCard
            title="Create Event"
            icon="plus-circle"
            onPress={() => router.push("/event.create")}
          />
          <HomeCard
            title="My Profile"
            icon="user"
            onPress={() => router.push("/profile")}
          />
        </View>

        <View style={styles.aiCard} >
          <View style={styles.aiHeaderRow}>
            <View style={styles.aiBadge}>
              <FontAwesome name="comment" size={14} color="#3F5E95" />
              <Text style={styles.aiBadgeText}>AI helper</Text>
            </View>

            <Pressable
              onPress={() => router.replace("/(tabs)/two")}
              style={styles.aiOpenBtn}
            >
              <Text style={styles.aiOpenBtnText}>Open chat</Text>
              <FontAwesome name="chevron-right" size={12} color="#3F5E95" />
            </Pressable>
          </View>

          <Text style={styles.aiHint}>
            Ask for event suggestions.
          </Text>

          <View style={styles.aiInputRow}>
            <TextInput
              value={aiText}
              onChangeText={setAiText}
              placeholder="e.g. Suggest volunteering events this weekend"
              placeholderTextColor="#8B93A7"
              style={styles.aiInput}
              returnKeyType="send"
              onSubmitEditing={() => {
                router.push({
                  pathname: "/(tabs)/ai-chat" as any,
                  params: { q: aiText },
                } as any);
              }}
            />
            <Pressable
              style={[styles.aiSendBtn, !aiText.trim() && { opacity: 0.5 }]}
              disabled={!aiText.trim()}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/ai-chat" as any,
                  params: { q: aiText },
                } as any)
              }
            >
              <FontAwesome name="send" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const bellStyles = StyleSheet.create({
  btn: {
    position: "absolute",
    top: 56,
    right: 22,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
});

function HomeCard({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: any;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.cardIconWrap}>
        <FontAwesome name={icon} size={20} color="#3F5E95" />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </Pressable>
  );
}
