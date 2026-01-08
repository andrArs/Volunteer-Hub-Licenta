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
}
