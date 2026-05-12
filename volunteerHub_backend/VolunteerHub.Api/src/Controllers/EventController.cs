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
    private readonly IBlobStorageService _blobStorage;

    public EventsController(IEventService events, UserManager<User> userManager, IBlobStorageService blobStorage)
    {
        _events = events;
        _userManager = userManager;
        _blobStorage = blobStorage;
    }

    private bool IsRo() =>
        (Request.Headers.AcceptLanguage.FirstOrDefault()?.Split(',')[0]?.Trim() ?? "en")
        .StartsWith("ro", StringComparison.OrdinalIgnoreCase);

    private string TranslateEventError(string code, string fallback, bool isRo) => isRo ? code switch
    {
        "title_required"         => "Titlul este obligatoriu.",
        "description_required"   => "Descrierea este obligatorie.",
        "location_name_required" => "Numele locației este obligatoriu.",
        "address_required"       => "Adresa este obligatorie.",
        "invalid_date_range"     => "Data de sfârșit trebuie să fie după data de început.",
        "invalid_max_volunteers" => "Numărul maxim de voluntari trebuie să fie cel puțin 1.",
        "event_not_found"        => "Evenimentul nu a fost găsit.",
        "forbidden"              => "Nu ai permisiunea pentru această acțiune.",
        "max_volunteers_reached" => "Ne pare rău, evenimentul a atins capacitatea maximă.",
        "invalid_token"          => "Token de check-in invalid.",
        "event_not_active"       => "Check-in-ul este disponibil doar în timpul evenimentului.",
        "not_registered"         => "Trebuie să fii înregistrat ca Going pentru a face check-in.",
        _                        => fallback
    } : fallback;

    [HttpGet]
    public async Task<ActionResult<PagedResult<EventResponse>>> GetApprovedEvents(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
        => Ok(await _events.GetApprovedEventsAsync(pageNumber, pageSize));


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
            bool isRo = IsRo();
            return StatusCode(ex.StatusCode, new { code = ex.Code, message = TranslateEventError(ex.Code, ex.Message, isRo) });
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
            bool isRo = IsRo();
            return StatusCode(ex.StatusCode, new { code = ex.Code, message = TranslateEventError(ex.Code, ex.Message, isRo) });
        }
    }

    [Authorize]
    [HttpPost("{id:guid}/image")]
    public async Task<ActionResult> UploadEventImage(Guid id, IFormFile file)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var ev = await _events.GetEventByIdAsync(id);
        if (ev is null) return NotFound();

        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && ev.CreatedById != userId) return Forbid();

        bool isRo = IsRo();

        if (file == null || file.Length == 0)
            return BadRequest(new { message = isRo ? "Niciun fișier furnizat." : "No file provided." });

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(new { code = "file_too_large", message = isRo ? "Fișierul depășește dimensiunea maximă de 10 MB." : "File size exceeds the maximum allowed size of 10 MB." });

        string[] allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { code = "invalid_file_type", message = isRo ? "Sunt permise doar imagini JPEG, PNG și WebP." : "Only JPEG, PNG, and WebP images are allowed." });

        var url = await _blobStorage.UploadEventImageAsync(file);
        await _events.SetEventImageAsync(id, url);

        return Ok(new { url });
    }

    [Authorize]
    [HttpDelete("{id:guid}/image")]
    public async Task<IActionResult> DeleteEventImage(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var ev = await _events.GetEventByIdAsync(id);
        if (ev is null) return NotFound();

        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && ev.CreatedById != userId) return Forbid();

        if (!string.IsNullOrEmpty(ev.ImageUrl))
        {
            await _blobStorage.DeleteEventImageAsync(ev.ImageUrl);
            await _events.SetEventImageAsync(id, null);
        }

        return NoContent();
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

    [Authorize(Roles = "Admin")]
    [HttpGet("pending")]
    public async Task<ActionResult<List<EventResponse>>> GetPendingEvents()
    {
        var events = await _events.GetPendingEventsAsync();
        return Ok(events);
    }

    [Authorize]
    [HttpGet("{id:guid}/stats")]
    public async Task<ActionResult<EventStatsResponse>> GetEventStats(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var isAdmin = User.IsInRole("Admin");
        try
        {
            var stats = await _events.GetEventStatsAsync(id, userId, isAdmin);
            return Ok(stats);
        }
        catch (ApiException ex)
        {
            bool isRo = IsRo();
            return StatusCode(ex.StatusCode, new { code = ex.Code, message = TranslateEventError(ex.Code, ex.Message, isRo) });
        }
    }

    public record CheckInDto(string Token);

    [Authorize]
    [HttpPost("check-in")]
    public async Task<IActionResult> CheckIn([FromBody] CheckInDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        try
        {
            await _events.CheckInAsync(dto.Token, userId);
            return NoContent();
        }
        catch (ApiException ex)
        {
            bool isRo = IsRo();
            return StatusCode(ex.StatusCode, new { code = ex.Code, message = TranslateEventError(ex.Code, ex.Message, isRo) });
        }
    }

    public record ChangeStatusDto(string Status, string Message);

    [Authorize(Roles = "Admin")]
    [HttpPost("{eventId:guid}/status")] 
    public async Task<IActionResult> SetEventStatus(Guid eventId, [FromBody] ChangeStatusDto dto)
    {
    
        var isAdmin = true; 

        if (!Enum.TryParse<Entities.Enum.EventStatus>(dto.Status, true, out var parsedStatus))
        {
            return BadRequest(new { message = "Invalid status value." });
        }

        var ok = await _events.SetStatusAsync(eventId, isAdmin, parsedStatus, dto.Message);

        if (!ok) return NotFound(new { code = "event_not_found", message = "Event not found." });
        
        return NoContent();
    }

}
