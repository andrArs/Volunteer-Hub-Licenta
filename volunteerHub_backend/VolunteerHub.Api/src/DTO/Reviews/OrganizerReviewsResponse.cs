namespace VolunteerHub.Api.src.DTO.Reviews;

public record OrganizerReviewsResponse(
    string OrganizerId,
    string OrganizerName,
    double AverageRating,
    int TotalReviews,
    List<ReviewResponse> Reviews
);
