using System.ComponentModel.DataAnnotations;
using VolunteerHub.Api.src.Entities.Enum;

namespace VolunteerHub.Api.src.DTO.Events;

public record EventRequest
(
    [Required, MaxLength(200)] string Title,
    [Required, MaxLength(2000)] string Description,
    [Required] EventCategory Category,
    [Required] DateTime StartDateTime,
    DateTime EndDateTime,
    [Required, MaxLength(300)] string LocationName,
    [Required, MaxLength(500)] string Address,
    double Latitude,
    double Longitude,
    int ?MaxVolunteers
);