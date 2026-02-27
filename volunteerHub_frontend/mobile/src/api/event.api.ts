import { api } from "./client";
import type { EventRequest, EventResponse } from "../types/event";

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

export async function getAllEvents(): Promise<EventResponse[]> {
    const res = await api.get<EventResponse[]>("/api/events");
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