import { api } from "./client";
import type { EventRequest, EventResponse } from "../types/event";

export async function createEvent(req: EventRequest): Promise<EventResponse> {   
    const res = await api.post<EventResponse>("/api/events", {
        Title: req.Title,
        Description: req.Description,
        Category: req.Category,
        StartDateTime: req.StartDateTime,
        EndDateTime: req.EndDateTime,
        LocationName: req.LocationName,
        Address: req.Address,
        Latitude: req.Latitude,
        Longitude: req.Longitude,
        MaxVolunteers: req.MaxVolunteers,
    });
    return res.data;
}