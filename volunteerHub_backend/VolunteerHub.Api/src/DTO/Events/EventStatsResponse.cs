namespace VolunteerHub.Api.src.DTO.Events;

public record EventStatsResponse(
    int GoingCount,
    int AttendedCount,
    int? MaxVolunteers,
    int? MinAge,
    int? MaxAge,
    double? AverageAge
);
