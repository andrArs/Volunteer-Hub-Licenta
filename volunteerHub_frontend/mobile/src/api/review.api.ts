import { api } from "./client";
import type { CreateReviewRequest, OrganizerReviewsResponse, ReviewResponse } from "../types/review";

export async function createReview(eventId: string, req: CreateReviewRequest): Promise<ReviewResponse> {
  const res = await api.post<ReviewResponse>(`/api/events/${eventId}/reviews`, req);
  return res.data;
}

export async function getEventReviews(eventId: string): Promise<ReviewResponse[]> {
  const res = await api.get<ReviewResponse[]>(`/api/events/${eventId}/reviews`);
  return res.data;
}

export async function getMyReviewStatus(eventId: string): Promise<boolean> {
  const res = await api.get<{ hasReviewed: boolean }>(`/api/events/${eventId}/reviews/my`);
  return res.data.hasReviewed;
}

export async function getOrganizerReviews(organizerId: string): Promise<OrganizerReviewsResponse> {
  const res = await api.get<OrganizerReviewsResponse>(`/api/users/${organizerId}/reviews`);
  return res.data;
}
