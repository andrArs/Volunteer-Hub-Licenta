using VolunteerHub.Api.src.DTO.Notifications;

namespace VolunteerHub.Api.src.Services;

public interface INotificationService
{
    Task<List<NotificationResponse>> GetNotificationsAsync(string userId);
    Task<bool> MarkAsReadAsync(Guid notificationId, string userId);
}
