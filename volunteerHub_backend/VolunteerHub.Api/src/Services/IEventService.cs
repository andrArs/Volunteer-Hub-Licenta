using VolunteerHub.Api.src.DTO.Events;

namespace VolunteerHub.Api.src.Services;

public interface IEventService
{
    Task<EventResponse> CreateEventAsync(string creatorUserId, EventRequest req);
    Task<EventResponse?> GetEventByIdAsync(Guid id);
    Task<List<EventResponse>> GetApprovedEventsAsync(); // public list
    Task<EventResponse?> UpdateEventAsync(Guid id, string requesterUserId, EventRequest req, bool isAdmin);
    Task<bool> DeleteEventAsync(Guid id, string requesterUserId, bool isAdmin);
}
