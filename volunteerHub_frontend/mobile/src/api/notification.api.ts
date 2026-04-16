import { api } from "./client";
import type { Notification } from "../types/notification";
import type { PagedResult } from "../types/event";

export async function getNotifications(pageNumber = 1, pageSize = 10): Promise<PagedResult<Notification>> {
  const res = await api.get<PagedResult<Notification>>(`/api/notifications?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  return res.data;
}

export async function markAsRead(id: string): Promise<void> {
  await api.patch(`/api/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await api.patch("/api/notifications/read-all");
}
