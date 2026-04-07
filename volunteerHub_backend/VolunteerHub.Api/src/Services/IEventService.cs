using VolunteerHub.Api.src.DTO.Events;
using VolunteerHub.Api.src.Entities.Enum;

namespace VolunteerHub.Api.src.Services;

public interface IEventService
{
    Task<EventResponse> CreateEventAsync(string creatorUserId, EventRequest req);
    Task<EventResponse?> GetEventByIdAsync(Guid id);
    Task<List<EventResponse>> GetApprovedEventsAsync(); // public list
    Task<EventResponse?> UpdateEventAsync(Guid id, string requesterUserId, EventRequest req, bool isAdmin);
    Task<bool> DeleteEventAsync(Guid id, string requesterUserId, bool isAdmin);
    Task<bool> UpdateEventAttendanceAsync(Guid eventId, string userId, string status);
    Task <int> GetEventParticipantsCountAsync(Guid eventId);
    Task <string> GetUserEventStatusAsync(Guid eventId, string userId);
    Task<List<EventResponse>> GetMyCreatedEventsAsync(string userId);
    Task<List<EventResponse>> GetMyAttendanceEventsAsync(string userId, string status);
    Task<List<EventResponse>> GetPendingEventsAsync();
    Task <bool> SetStatusAsync(Guid eventId, bool isAdmin, EventStatus status, string message);
}
