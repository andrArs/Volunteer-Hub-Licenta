using VolunteerHub.Api.src.DTO.Events;
using VolunteerHub.Api.src.DTO.Notifications;

namespace VolunteerHub.Api.src.Services;

public interface INotificationService
{
    Task<PagedResult<NotificationResponse>> GetNotificationsAsync(string userId, int pageNumber, int pageSize);
    Task<bool> MarkAsReadAsync(Guid notificationId, string userId);
    Task MarkAllAsReadAsync(string userId);
}
