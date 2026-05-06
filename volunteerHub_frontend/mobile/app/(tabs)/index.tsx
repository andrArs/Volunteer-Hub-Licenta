import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useCallback, useState } from "react";
import { styles } from "@/src/styles/home.styles";
import { getAuth, logout } from "@/src/store/auth.store";
import { getNotifications } from "@/src/api/notification.api";
import { t, useLanguage } from "@/src/i18n/index";


export default function HomeScreen() {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();
  const [aiText, setAiText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const auth = getAuth();
  const isAdmin = auth?.roles?.includes("Admin") ?? false;

  const fetchCount = useCallback(() =>
    getNotifications(1, 100)
      .then((result) => setUnreadCount(result.items.filter((n) => !n.isRead).length))
      .catch(() => setUnreadCount(0)),
  []);

  useFocusEffect(
    useCallback(() => {
      fetchCount();
      const interval = setInterval(fetchCount, 30000);
      return () => clearInterval(interval);
    }, [fetchCount])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCount();
    setRefreshing(false);
  }, [fetchCount]);

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View style={styles.langRow}>
          <Pressable
            onPress={() => setLocale("en")}
            style={[styles.langBtn, locale === "en" && styles.langBtnActive]}
          >
            <Text style={[styles.langText, locale === "en" && styles.langTextActive]}>EN</Text>
          </Pressable>
          <Pressable
            onPress={() => setLocale("ro")}
            style={[styles.langBtn, locale === "ro" && styles.langBtnActive]}
          >
            <Text style={[styles.langText, locale === "ro" && styles.langTextActive]}>RO</Text>
          </Pressable>
        </View>
        <Text style={styles.headerTitle}>{t("home.welcome")}</Text>
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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3F5E95"]} tintColor="#3F5E95" />}>
        <View style={styles.grid}>

          {isAdmin && (
            <HomeCard
              title={t("home.manageEvents")}
              icon="shield"
              onPress={() => router.push("/admin.pending.events")}
            />
          )}

          {isAdmin && (
            <HomeCard
              title={t("home.manageUsers")}
              icon="users"
              onPress={() => router.push("/users.view")}
            />
          )}

          <HomeCard
            title={t("home.myEvents")}
            icon="calendar"
            onPress={() => router.push("/my.events")}
          />
          <HomeCard
            title={t("home.viewEvents")}
            icon="search"
            onPress={() => router.push("/events.view")}
          />

          <HomeCard
            title={t("home.createEvent")}
            icon="plus-circle"
            onPress={() => router.push("/event.create")}
          />
          <HomeCard
            title={t("home.myProfile")}
            icon="user"
            onPress={() => router.push("/profile")}
          />
        </View>

        <View style={styles.aiCard} >
          <View style={styles.aiHeaderRow}>
            <View style={styles.aiBadge}>
              <FontAwesome name="comment" size={14} color="#3F5E95" />
              <Text style={styles.aiBadgeText}>{t("home.aiBadge")}</Text>
            </View>

            <Pressable
              onPress={() => router.replace("/ai.chat")}
              style={styles.aiOpenBtn}
            >
              <Text style={styles.aiOpenBtnText}>{t("home.openChat")}</Text>
              <FontAwesome name="chevron-right" size={12} color="#3F5E95" />
            </Pressable>
          </View>

          <Text style={styles.aiHint}>{t("home.aiHint")}</Text>

          <View style={styles.aiInputRow}>
            <TextInput
              value={aiText}
              onChangeText={setAiText}
              placeholder={t("home.aiPlaceholder")}
              placeholderTextColor="#8B93A7"
              style={styles.aiInput}
              returnKeyType="send"
              onSubmitEditing={() => {
                router.push({
                  pathname: "/ai.chat" as any,
                  params: { q: aiText },
                } as any);
              }}
            />
            <Pressable
              style={[styles.aiSendBtn, !aiText.trim() && styles.aiSendBtnDisabled]}
              disabled={!aiText.trim()}
              onPress={() =>
                router.push({
                  pathname: "/ai.chat" as any,
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
          <Text style={styles.logoutText}>{t("home.logout")}</Text>
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
