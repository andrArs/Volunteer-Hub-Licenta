using Microsoft.EntityFrameworkCore;
using VolunteerHub.Api.src.Data;
using VolunteerHub.Api.src.Entities;
using VolunteerHub.Api.src.Entities.Enum;

namespace VolunteerHub.Api.src.Services;

public class ReminderBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ReminderBackgroundService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);

    public ReminderBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<ReminderBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SendRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while sending event reminders.");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task SendRemindersAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTime.UtcNow;

        var window24hStart = now.AddHours(23).AddMinutes(45);
        var window24hEnd = now.AddHours(24).AddMinutes(15);

        var window1hStart = now.AddMinutes(45);
        var window1hEnd = now.AddMinutes(75);

        var pending = await db.UserEvents
            .Include(ue => ue.Event)
            .Include(ue => ue.User)
            .Where(ue =>
                (ue.Status == UserEventStatus.Interested || ue.Status == UserEventStatus.Going) &&
                ue.Event.Status == EventStatus.Approved &&
                (
                    (!ue.Reminder24hSent && ue.Event.StartDateTime >= window24hStart && ue.Event.StartDateTime <= window24hEnd) ||
                    (!ue.Reminder1hSent && ue.Event.StartDateTime >= window1hStart && ue.Event.StartDateTime <= window1hEnd)
                )
            )
            .ToListAsync(stoppingToken);

        if (pending.Count == 0)
            return;

        var notifications = new List<Notification>();

        foreach (var ue in pending)
        {
            var ev = ue.Event;

            bool isRo = ue.User?.Language == "ro";

            if (!ue.Reminder24hSent &&
                ev.StartDateTime >= window24hStart &&
                ev.StartDateTime <= window24hEnd)
            {
                notifications.Add(new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = ue.UserId,
                    EventId = ev.Id,
                    Message = isRo
                        ? $"Reminder: \"{ev.Title}\" începe mâine. Ne vedem acolo!"
                        : $"Reminder: \"{ev.Title}\" starts tomorrow. See you there!",
                    CreatedAt = now,
                    IsRead = false
                });
                ue.Reminder24hSent = true;
            }

            if (!ue.Reminder1hSent &&
                ev.StartDateTime >= window1hStart &&
                ev.StartDateTime <= window1hEnd)
            {
                notifications.Add(new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = ue.UserId,
                    EventId = ev.Id,
                    Message = isRo
                        ? $"\"{ev.Title}\" începe în aproximativ 1 oră. Pregătește-te!"
                        : $"\"{ev.Title}\" starts in about 1 hour. Get ready!",
                    CreatedAt = now,
                    IsRead = false
                });
                ue.Reminder1hSent = true;
            }
        }

        if (notifications.Count > 0)
        {
            db.Notifications.AddRange(notifications);
            await db.SaveChangesAsync(stoppingToken);
            _logger.LogInformation("Sent {Count} event reminder notifications.", notifications.Count);
        }
    }
}
