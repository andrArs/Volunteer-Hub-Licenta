export type ReviewResponse = {
  id: string;
  eventId: string;
  eventTitle: string;
  reviewerId: string;
  reviewerName: string;
  organizerId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
};

export type OrganizerReviewsResponse = {
  organizerId: string;
  organizerName: string;
  averageRating: number;
  totalReviews: number;
  reviews: ReviewResponse[];
};

export type CreateReviewRequest = {
  rating: number;
  comment?: string | null;
};
