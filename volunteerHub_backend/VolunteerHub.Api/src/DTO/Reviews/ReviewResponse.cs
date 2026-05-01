namespace VolunteerHub.Api.src.DTO.Reviews;

public record ReviewResponse(
    Guid Id,
    Guid EventId,
    string EventTitle,
    string ReviewerId,
    string ReviewerName,
    string OrganizerId,
    int Rating,
    string? Comment,
    DateTime CreatedAt
);
