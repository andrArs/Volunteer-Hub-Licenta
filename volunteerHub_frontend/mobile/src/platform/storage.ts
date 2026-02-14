import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { AuthResponse } from "../types/auth";

const KEY = "auth_token";
const AUTH_KEY = "auth_data";

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(KEY);
  }
  return SecureStore.getItemAsync(KEY);
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(KEY, token);
    return;
  }
  await SecureStore.setItemAsync(KEY, token);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(KEY);
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}

export async function setAuthData(auth: AuthResponse): Promise<void> {
  const raw = JSON.stringify(auth);
  if (Platform.OS === "web") {
    localStorage.setItem(AUTH_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(AUTH_KEY, raw);
}

export async function getAuthData(): Promise<AuthResponse | null> {
  const raw =
    Platform.OS === "web"
      ? localStorage.getItem(AUTH_KEY)
      : await SecureStore.getItemAsync(AUTH_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

export async function clearAuthData(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(AUTH_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(AUTH_KEY);
}
