import axios from "axios";
import { router } from "expo-router";
import { API_BASE_URL } from "../config/env";
import { getToken } from "../platform/storage";
import { logout } from "../store/auth.store";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const token = await getToken();
      if (token) {
        await logout();
        router.replace("/(auth)/login");
      }
    }
    return Promise.reject(error);
  }
);
