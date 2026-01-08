using VolunteerHub.Api.src.Entities.Enum;

namespace VolunteerHub.Api.src.DTO.Events;

public record EventResponse
(
    Guid Id,
    string Title,
    string Description,
    EventCategory Category,
    DateTime StartDateTime,
    DateTime EndDateTime,
    string LocationName,
    string Address,
    double Latitude,
    double Longitude,
    int? MaxVolunteers,
    EventStatus Status,
    DateTime CreatedAt,
    string CreatedById
);