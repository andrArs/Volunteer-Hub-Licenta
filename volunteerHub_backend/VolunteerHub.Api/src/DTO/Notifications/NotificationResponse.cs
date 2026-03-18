using System;

namespace VolunteerHub.Api.src.DTO.Notifications;

public record NotificationResponse(
    Guid Id,
    string Message,
    bool IsRead,
    DateTime CreatedAt,
    Guid? EventId
);
