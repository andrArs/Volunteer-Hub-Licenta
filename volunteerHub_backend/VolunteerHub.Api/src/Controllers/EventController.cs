using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VolunteerHub.Api.src.DTO.Events;
using VolunteerHub.Api.src.Services;
using VolunteerHub.Api.src.Entities;
using VolunteerHub.Api.src.Exceptions;

namespace VolunteerHub.Api.src.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private readonly IEventService _events;
    private readonly UserManager<User> _userManager;

    public EventsController(IEventService events, UserManager<User> userManager)
    {
        _events = events;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<ActionResult<List<EventResponse>>> GetApprovedEvents()
        => Ok(await _events.GetApprovedEventsAsync());


    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EventResponse>> GetEventById(Guid id)
    {
        var ev = await _events.GetEventByIdAsync(id);
        return ev is null ? NotFound() : Ok(ev);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<EventResponse>> CreateEvent([FromBody] EventRequest req)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
       
        try{
        var created = await _events.CreateEventAsync(userId, req);

        var user = await _userManager.FindByIdAsync(userId);
        if (user != null && !await _userManager.IsInRoleAsync(user, "Creator"))
        {
            await _userManager.AddToRoleAsync(user, "Creator");
        }

            return CreatedAtAction(nameof(GetEventById), new { id = created.Id }, created);
        }
        catch(ApiException ex)
        {
            return StatusCode(ex.StatusCode, new { code = ex.Code, message = ex.Message });
        }
    }


    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EventResponse>> UpdateEvent(Guid id, [FromBody] EventRequest req)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var isAdmin = User.IsInRole("Admin");
        try
        {
            var updated = await _events.UpdateEventAsync(id, userId, req, isAdmin);
            return updated is null ? Forbid() : Ok(updated);
        }
        catch (ApiException ex)
        {
            return StatusCode(ex.StatusCode, new { code = ex.Code, message = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteEvent(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var isAdmin = User.IsInRole("Admin");
        var ok = await _events.DeleteEventAsync(id, userId, isAdmin);

        if (!ok) return Forbid();
        return NoContent();
    }

    [Authorize]
    [HttpPost("{id:guid}/attendance")]
    public async Task<IActionResult> UpdateAttendance(Guid id, [FromBody] AttendanceEventRequest req)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var validStatuses = new[] { "interested", "going", "attended", "cancelled", "none" };
        if (!validStatuses.Contains(req.Status.ToLower()))
            return BadRequest(new { code = "invalid_status", message = $"Status must be one of: {string.Join(", ", validStatuses)}" });

        var ok = await _events.UpdateEventAttendanceAsync(id, userId, req.Status.ToLower());

        if (!ok) return NotFound(new { code = "event_not_found_or_full", message = "Event not found or has reached maximum volunteers." });
        return NoContent();
    }

    
    [HttpGet("{id:guid}/participants/count")]
    public async Task<ActionResult<int>> GetParticipantsCount(Guid id)
    {
        var count = await _events.GetEventParticipantsCountAsync(id);
        return Ok(new { count });
    }

    [Authorize]
    [HttpGet("{id:guid}/status")]
    public async Task<ActionResult<string>> GetUserEventStatus(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var status = await _events.GetUserEventStatusAsync(id, userId);
        return Ok(new { status = status });
    }

    [Authorize]
    [HttpGet("my/created")]
    public async Task<ActionResult<List<EventResponse>>> GetMyCreatedEvents()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var events = await _events.GetMyCreatedEventsAsync(userId);
        return Ok(events);
    }

    [Authorize]
    [HttpGet("my/attendance")]
    public async Task<ActionResult<List<EventResponse>>> GetMyAttendanceEvents([FromQuery] string status)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var validStatuses = new[] { "interested", "going", "history" };
        if (string.IsNullOrWhiteSpace(status) || !validStatuses.Contains(status.ToLower()))
            return BadRequest(new { code = "invalid_status", message = "Status must be interested, going, or history." });

        var events = await _events.GetMyAttendanceEventsAsync(userId, status.ToLower());
        return Ok(events);
    }

}
