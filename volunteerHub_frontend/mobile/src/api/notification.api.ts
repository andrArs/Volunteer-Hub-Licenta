import { api } from "./client";
import type { Notification } from "../types/notification";

export async function getNotifications(): Promise<Notification[]> {
  const res = await api.get<Notification[]>("/api/notifications");
  return res.data;
}

export async function markAsRead(id: string): Promise<void> {
  await api.patch(`/api/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await api.patch("/api/notifications/read-all");
}
