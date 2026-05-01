using VolunteerHub.Api.src.DTO.Reviews;

namespace VolunteerHub.Api.src.Services;

public interface IReviewService
{
    Task<ReviewResponse> CreateReviewAsync(Guid eventId, string reviewerId, CreateReviewRequest req);
    Task<List<ReviewResponse>> GetEventReviewsAsync(Guid eventId);
    Task<bool> HasReviewedAsync(Guid eventId, string reviewerId);
    Task<OrganizerReviewsResponse?> GetOrganizerReviewsAsync(string organizerId);
}
