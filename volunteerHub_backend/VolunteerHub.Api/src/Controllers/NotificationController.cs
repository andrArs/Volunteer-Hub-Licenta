using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VolunteerHub.Api.src.Services;

namespace VolunteerHub.Api.src.Controllers;

[ApiController]
[Route("api/notifications")]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notifications;

    public NotificationController(INotificationService notifications)
    {
        _notifications = notifications;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult> GetMyNotifications()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var notifications = await _notifications.GetNotificationsAsync(userId);
        return Ok(notifications);
    }

    [Authorize]
    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var ok = await _notifications.MarkAsReadAsync(id, userId);
        if (!ok) return NotFound();

        return NoContent();
    }
}
