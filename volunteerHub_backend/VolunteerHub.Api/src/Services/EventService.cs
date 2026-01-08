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
            CreatedById = creatorUserId
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
            ev.CreatedById
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
            ev.CreatedById
        );
    }

    public async Task<List<EventResponse>> GetApprovedEventsAsync()
    {
         var list = await _db.Events.AsNoTracking()
            .Where(e => e.Status == EventStatus.Approved)
            .OrderBy(e => e.StartDateTime)
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
                e.CreatedById
            ))
            .ToListAsync();

        return list;
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
            ev.CreatedById
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

}