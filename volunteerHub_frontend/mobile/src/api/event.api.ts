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