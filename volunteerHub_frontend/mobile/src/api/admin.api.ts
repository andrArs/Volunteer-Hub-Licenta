import { EventResponse, EventStatus } from "../types/event";
import { api } from "./client";

export async function getPendingEvents(): Promise<EventResponse[]> {
  const response = await api.get("api/events/pending");
  return response.data;
}

export async function setEventStatus(eventId: string, status: EventStatus, message: string = ""): Promise<void> {
  await api.post(`api/events/${eventId}/status`, {
    status: status === EventStatus.Approved ? "Approved" : "Rejected", 
    message: message
  });
}