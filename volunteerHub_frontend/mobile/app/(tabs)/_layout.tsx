import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Stack, Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { getToken } from "@/src/platform/storage";
import { initAuth } from "@/src/store/auth.store";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const headerShown = useClientOnlyValue(true, true);

  useEffect(() => {
    async function checkAuth() {
      try {
        await initAuth();
        const token = await getToken();
        if (token) {
          setIsAuthorized(true);
        } else {
          router.replace("/(auth)/login");
        }
      } catch (e) {
        console.error("Auth check failed:", e);
        router.replace("/(auth)/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return null;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false, 
        animation: 'slide_from_right', 
      }}
    >
      <Stack.Screen name="index" /> 
      <Stack.Screen name="events.view" />
      <Stack.Screen name="my.events" />
      <Stack.Screen name="event.view" />
      <Stack.Screen name="event.create" />
      <Stack.Screen name="event.update" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="two" />
      <Stack.Screen name="admin.pending.events" />
      <Stack.Screen name="users.view" />
      <Stack.Screen name="user.view" />
      <Stack.Screen name="user.update" />
      <Stack.Screen name="ai.chat" />

    </Stack>
  );
}
