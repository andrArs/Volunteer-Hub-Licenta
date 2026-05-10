using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.EntityFrameworkCore;
using VolunteerHub.Api.src.Data;
using VolunteerHub.Api.src.DTO.Events;
using VolunteerHub.Api.src.Entities;
using VolunteerHub.Api.src.Entities.Enum;
using VolunteerHub.Api.src.Exceptions;

namespace VolunteerHub.Api.src.Services;

public class EventService : IEventService
{
    private readonly AppDbContext _db;
    public EventService(AppDbContext db)
    {
        _db = db;
    } 

    public async Task<EventResponse> CreateEventAsync(string creatorUserId, EventRequest request)
    {
        if (request.EndDateTime <= request.StartDateTime)
            throw new ApiException(400, "INVALID_END_TIME", "End Date must be after Start Date.");

        if(request.MaxVolunteers.HasValue && request.MaxVolunteers < 1)
            throw new ApiException(400, "INVALID_MAX_VOLUNTEERS", "Max Volunteers must be an integer greater than zero.");

        if (string.IsNullOrWhiteSpace(request.Title))
            throw new ApiException(400, "title_required", "Title is required.");

        if (string.IsNullOrWhiteSpace(request.Description))
            throw new ApiException(400, "description_required", "Description is required.");

        if (string.IsNullOrWhiteSpace(request.LocationName))
            throw new ApiException(400, "location_name_required", "LocationName is required.");

        if (string.IsNullOrWhiteSpace(request.Address))
            throw new ApiException(400, "address_required", "Address is required.");
    
        var ev = new Event
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Category = request.Category,
            StartDateTime = request.StartDateTime,
            EndDateTime = request.EndDateTime,
            LocationName = request.LocationName.Trim(),
            Address = request.Address.Trim(),
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            MaxVolunteers = request.MaxVolunteers ?? 0,
            Status = EventStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            CreatedById = creatorUserId,
            CheckInToken = Guid.NewGuid().ToString("N")
        };

        _db.Events.Add(ev);
        await _db.SaveChangesAsync();

        return new EventResponse(
            ev.Id,
            ev.Title,
            ev.Description,
            ev.Category,
            ev.StartDateTime,
            ev.EndDateTime,
            ev.LocationName,
            ev.Address,
            ev.Latitude,
            ev.Longitude,
            ev.MaxVolunteers,
            ev.Status,
            ev.CreatedAt,
            ev.CreatedById,
            ev.AdminNotes,
            ImageUrl: ev.ImageUrl,
            CheckInToken: ev.CheckInToken
        );
    }

    public async Task<EventResponse?> GetEventByIdAsync(Guid id)
    {
        var ev= await _db.Events.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        return ev is null ? null : new EventResponse(
            ev.Id,
            ev.Title,
            ev.Description,
            ev.Category,
            ev.StartDateTime,
            ev.EndDateTime,
            ev.LocationName,
            ev.Address,
            ev.Latitude,
            ev.Longitude,
            ev.MaxVolunteers,
            ev.Status,
            ev.CreatedAt,
            ev.CreatedById,
            ev.AdminNotes,
            ImageUrl: ev.ImageUrl,
            CheckInToken: ev.CheckInToken
        );
    }

    public async Task<PagedResult<EventResponse>> GetApprovedEventsAsync(int pageNumber, int pageSize)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 50) pageSize = 50;

        var now = DateTime.UtcNow;
        var query = _db.Events.AsNoTracking()
            .Where(e => e.Status == EventStatus.Approved && e.EndDateTime >= now)
            .OrderBy(e => e.StartDateTime);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new EventResponse(
                e.Id,
                e.Title,
                e.Description,
                e.Category,
                e.StartDateTime,
                e.EndDateTime,
                e.LocationName,
                e.Address,
                e.Latitude,
                e.Longitude,
                e.MaxVolunteers,
                e.Status,
                e.CreatedAt,
                e.CreatedById,
                e.AdminNotes,
                e.CreatedBy.FirstName + " " + e.CreatedBy.LastName,
                e.CreatedBy.Email,
                e.ImageUrl,
                e.CheckInToken
            ))
            .ToListAsync();

        return new PagedResult<EventResponse>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<EventResponse?> UpdateEventAsync(Guid id, string requesterUserId, EventRequest req, bool isAdmin)
    {
         var ev = await _db.Events.FirstOrDefaultAsync(e => e.Id == id);

        if (ev is null)
            throw new ApiException(404, "event_not_found", "Event not found.");

        if (!isAdmin && ev.CreatedById != requesterUserId)
            throw new ApiException(403, "forbidden", "You cannot edit this event.");

        if (string.IsNullOrWhiteSpace(req.Title))
            throw new ApiException(400, "title_required", "Title is required.");

        if (req.EndDateTime <= req.StartDateTime)
            throw new ApiException(400, "invalid_date_range", "End Date must be after Start Date.");

        if (req.MaxVolunteers is not null && req.MaxVolunteers < 1)
            throw new ApiException(400, "invalid_max_volunteers", "MaxVolunteers must be at least 1.");

        ev.Title = req.Title.Trim();
        ev.Description = req.Description.Trim();
        ev.Category = req.Category;
        ev.StartDateTime = req.StartDateTime;
        ev.EndDateTime = req.EndDateTime;
        ev.LocationName = req.LocationName.Trim();
        ev.Address = req.Address.Trim();
        ev.Latitude = req.Latitude;
        ev.Longitude = req.Longitude;
        ev.MaxVolunteers = req.MaxVolunteers ?? 0;

        if (!isAdmin) ev.Status = EventStatus.Pending;

        await _db.SaveChangesAsync();
        return new EventResponse(
            ev.Id,
            ev.Title,
            ev.Description,
            ev.Category,
            ev.StartDateTime,
            ev.EndDateTime,
            ev.LocationName,
            ev.Address,
            ev.Latitude,
            ev.Longitude,
            ev.MaxVolunteers,
            ev.Status,
            ev.CreatedAt,
            ev.CreatedById,
            ev.AdminNotes,
            ImageUrl: ev.ImageUrl,
            CheckInToken: ev.CheckInToken
        );
    }

     public async Task<bool> DeleteEventAsync(Guid id, string requesterUserId, bool isAdmin)
    {
        var ev = await _db.Events.FirstOrDefaultAsync(e => e.Id == id);
        if (ev is null)
            throw new ApiException(404, "event_not_found", "Event not found.");

        if (!isAdmin && ev.CreatedById != requesterUserId)
            throw new ApiException(403, "forbidden", "You cannot delete this event.");

        _db.Events.Remove(ev);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateEventAttendanceAsync(Guid eventId, string userId, string status)
    {
        var ev = await _db.Events.Include(e => e.UserEvents).FirstOrDefaultAsync(e => e.Id == eventId);
        if (ev is null)
            throw new ApiException(404, "event_not_found", "Event not found.");
    
        var existingRecord = await _db.UserEvents.FirstOrDefaultAsync(a => a.EventId == eventId && a.UserId == userId);

        if(status == "none")
        {
            if(existingRecord != null)
            {
                _db.UserEvents.Remove(existingRecord);
                await _db.SaveChangesAsync();
            }
            return true;
        }
        
        UserEventStatus newStatus = status.ToLower()== "going" 
        ? UserEventStatus.Going 
        : UserEventStatus.Interested;

        if (newStatus == UserEventStatus.Going && (existingRecord == null || existingRecord.Status != UserEventStatus.Going))
    {
        if (ev.MaxVolunteers > 0)
        {
            var currentGoingCount = ev.UserEvents.Count(ue => ue.Status == UserEventStatus.Going);
            
            if (currentGoingCount >= ev.MaxVolunteers)
            {
                throw new ApiException(400, "max_volunteers_reached", "Sorry, this event has reached its maximum capacity.");
            }
        }
    }

        if(existingRecord != null)
        {
            existingRecord.Status = newStatus;
        }
        else
        {
            var newRecord = new UserEvent
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                EventId = eventId,
                Status = newStatus,
                RegisteredAt = DateTime.UtcNow
            };
            _db.UserEvents.Add(newRecord);
        }
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetEventParticipantsCountAsync(Guid eventId)
    {
        var count = await _db.UserEvents.CountAsync(ue => ue.EventId == eventId && ue.Status == UserEventStatus.Going);
        return count;
    }

    public async Task<string> GetUserEventStatusAsync(Guid eventId, string userId)
    {
        var record = await _db.UserEvents.FirstOrDefaultAsync(ue => ue.EventId == eventId && ue.UserId == userId);
        return record?.Status.ToString().ToLower() ?? "none";
    }

    public async Task<List<EventResponse>> GetMyCreatedEventsAsync(string userId)
    {
        var list = await _db.Events.AsNoTracking()
            .Where(e => e.CreatedById == userId)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new EventResponse(
                e.Id,
                e.Title,
                e.Description,
                e.Category,
                e.StartDateTime,
                e.EndDateTime,
                e.LocationName,
                e.Address,
                e.Latitude,
                e.Longitude,
                e.MaxVolunteers,
                e.Status,
                e.CreatedAt,
                e.CreatedById,
                e.AdminNotes,
                e.CreatedBy.FirstName + " " + e.CreatedBy.LastName,
                e.CreatedBy.Email,
                e.ImageUrl,
                e.CheckInToken
            ))
            .ToListAsync();

        return list;
    }

    public async Task<List<EventResponse>> GetMyAttendanceEventsAsync(string userId, string status)
    {
        var now = DateTime.UtcNow;
        var query = _db.UserEvents.Where(ue => ue.UserId == userId);

        if (status == "going")
        {
            query = query.Where(ue => ue.Status == UserEventStatus.Going && ue.Event.EndDateTime >= now);
        }
        else if (status == "interested")
        {
            query = query.Where(ue => ue.Status == UserEventStatus.Interested && ue.Event.EndDateTime >= now);
        }
        else if (status == "history")
        {
            query = query.Where(ue => (ue.Status == UserEventStatus.Going || ue.Status == UserEventStatus.Attended) && ue.Event.EndDateTime < now);
        }
        else 
        {
            return new List<EventResponse>();
        }

        return await query
            .Include(ue => ue.Event)
            .OrderBy(ue => ue.Event.StartDateTime)
            .Select(ue => ue.Event)
            .Select(e => new EventResponse(
                e.Id, e.Title, e.Description, e.Category, e.StartDateTime,
                e.EndDateTime, e.LocationName, e.Address, e.Latitude,
                e.Longitude, e.MaxVolunteers, e.Status, e.CreatedAt, e.CreatedById, e.AdminNotes,
                e.CreatedBy.FirstName + " " + e.CreatedBy.LastName,
                e.CreatedBy.Email,
                e.ImageUrl,
                e.CheckInToken
            ))
            .ToListAsync();
    }

    public async Task <List<EventResponse>> GetPendingEventsAsync()
    {
        var list = await _db.Events.AsNoTracking()
            .Where(e => e.Status == EventStatus.Pending)
            .OrderBy(e => e.CreatedAt)
            .Select(e => new EventResponse(
                e.Id,
                e.Title,
                e.Description,
                e.Category,
                e.StartDateTime,
                e.EndDateTime,
                e.LocationName,
                e.Address,
                e.Latitude,
                e.Longitude,
                e.MaxVolunteers,
                e.Status,
                e.CreatedAt,
                e.CreatedById,
                e.AdminNotes,
                e.CreatedBy.FirstName + " " + e.CreatedBy.LastName,
                e.CreatedBy.Email,
                e.ImageUrl,
                e.CheckInToken
            ))
            .ToListAsync();

            return list;
    }

    public async Task SetEventImageAsync(Guid eventId, string? imageUrl)
    {
        var ev = await _db.Events.FirstOrDefaultAsync(e => e.Id == eventId);
        if (ev is null) return;
        ev.ImageUrl = imageUrl;
        await _db.SaveChangesAsync();
    }

    public async Task<bool> CheckInAsync(string token, string userId)
    {
        var ev = await _db.Events.FirstOrDefaultAsync(e => e.CheckInToken != null && e.CheckInToken == token);
        if (ev is null)
            throw new ApiException(404, "invalid_token", "Invalid check-in token.");

        var now = DateTime.UtcNow;
        if (now < ev.StartDateTime || now > ev.EndDateTime)
            throw new ApiException(400, "event_not_active", "Check-in is only available while the event is active.");

        var userEvent = await _db.UserEvents.FirstOrDefaultAsync(ue => ue.EventId == ev.Id && ue.UserId == userId);
        if (userEvent is null || userEvent.Status != UserEventStatus.Going)
            throw new ApiException(400, "not_registered", "You must be registered as Going to check in.");

        userEvent.Status = UserEventStatus.Attended;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetStatusAsync(Guid eventId, bool isAdmin, EventStatus status, string message)
    {
        var ev = await _db.Events.FirstOrDefaultAsync(e => e.Id == eventId);
        
        if (ev is null)
            throw new ApiException(404, "event_not_found", "Event not found.");
            
        if (!isAdmin)
        {
            throw new ApiException(403, "forbidden", "You cannot change the status of this event.");
        }

        ev.Status = status;

        ev.AdminNotes = message; 

        string notificationMessage = "";

        if (status == EventStatus.Rejected)
        {
            notificationMessage = string.IsNullOrWhiteSpace(message) 
                ? "Your event has been rejected. Please check the event details for more information." 
                : $"Your event '{ev.Title}' was rejected. Reason: {message}";
        }
        else if (status == EventStatus.Approved)
        {
            notificationMessage = $"Great news! Your event '{ev.Title}' has been approved and is now public.";
        }

        if (!string.IsNullOrEmpty(notificationMessage))
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = ev.CreatedById, 
                EventId = ev.Id,
                Message = notificationMessage,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            _db.Notifications.Add(notification);
        }

        await _db.SaveChangesAsync();
        return true;
    }
}