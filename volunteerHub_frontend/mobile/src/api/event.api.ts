import { Platform } from "react-native";
import { api } from "./client";
import type { EventRequest, EventResponse, PagedResult } from "../types/event";

export async function createEvent(req: EventRequest): Promise<EventResponse> {   
    const res = await api.post<EventResponse>("/api/events", {
        Title: req.title,
        Description: req.description,
        Category: req.category,
        StartDateTime: req.startDateTime,
        EndDateTime: req.endDateTime,
        LocationName: req.locationName,
        Address: req.address,
        Latitude: req.latitude,
        Longitude: req.longitude,
        MaxVolunteers: req.maxVolunteers,
    });
    return res.data;
}

export async function getEventById(eventId: string): Promise<EventResponse> {
  const res = await api.get<EventResponse>(`/api/events/${eventId}`);
  return res.data;
}

export async function updateEvent(eventId: string, req: EventRequest): Promise<EventResponse> {
    const res = await api.put<EventResponse>(`/api/events/${eventId}`, {
        Title: req.title,
        Description: req.description,
        Category: req.category,
        StartDateTime: req.startDateTime,
        EndDateTime: req.endDateTime,
        LocationName: req.locationName,
        Address: req.address,
        Latitude: req.latitude,
        Longitude: req.longitude,
        MaxVolunteers: req.maxVolunteers,
    });
    return res.data;
}

export async function getAllEvents(pageNumber = 1, pageSize = 10): Promise<PagedResult<EventResponse>> {
    const res = await api.get<PagedResult<EventResponse>>(`/api/events?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return res.data;
}

export async function deleteEvent(eventId: string): Promise<void> {
    await api.delete(`/api/events/${eventId}`);
}

export async function updateEventAttendance(eventId: string, status: string): Promise<void> {
    await api.post(`/api/events/${eventId}/attendance`, {
        Status: status
    });
}

export async function getEventParticipantsCount(eventId: string): Promise<number> {
    const res = await api.get<{ count: number }>(`/api/events/${eventId}/participants/count`);
    return res.data.count;
}

export async function getUserEventStatus(eventId: string): Promise<string> {
    const res = await api.get(`/api/events/${eventId}/status`);
    return res.data.status || res.data || "none";
}

export async function getMyCreatedEvents(): Promise<EventResponse[]> {
  const res = await api.get<EventResponse[]>("/api/events/my/created");
  return res.data;
}

export async function getMyAttendanceEvents(status: "interested" | "going" | "history"): Promise<EventResponse[]> {
  const res = await api.get<EventResponse[]>(`/api/events/my/attendance?status=${status}`);
  return res.data;
}

export async function uploadEventImage(eventId: string, uri: string, mimeType?: string): Promise<string> {
  const formData = new FormData();
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], "event.jpg", { type: blob.type || "image/jpeg" });
    formData.append("file", file);
  } else {
    formData.append("file", { uri, name: "event.jpg", type: mimeType || "image/jpeg" } as any);
  }
  const res = await api.post<{ url: string }>(`/api/events/${eventId}/image`, formData, {
    headers: Platform.OS === "web" ? {} : { "Content-Type": "multipart/form-data" },
  });
  return res.data.url;
}

export async function removeEventImage(eventId: string): Promise<void> {
  await api.delete(`/api/events/${eventId}/image`);
}

export async function checkIn(token: string): Promise<void> {
  await api.post("/api/events/check-in", { Token: token });
}

export type EventStatsResponse = {
  goingCount: number;
  attendedCount: number;
  maxVolunteers?: number | null;
  minAge?: number | null;
  maxAge?: number | null;
  averageAge?: number | null;
};

export async function getEventStats(eventId: string): Promise<EventStatsResponse> {
  const res = await api.get<EventStatsResponse>(`/api/events/${eventId}/stats`);
  return res.data;
}