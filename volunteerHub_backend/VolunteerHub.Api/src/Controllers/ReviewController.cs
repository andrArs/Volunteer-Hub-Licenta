using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VolunteerHub.Api.src.DTO.Reviews;
using VolunteerHub.Api.src.Exceptions;
using VolunteerHub.Api.src.Services;

namespace VolunteerHub.Api.src.Controllers;

[ApiController]
[Route("api")]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviews;

    public ReviewController(IReviewService reviews)
    {
        _reviews = reviews;
    }

    [Authorize]
    [HttpPost("events/{eventId:guid}/reviews")]
    public async Task<ActionResult<ReviewResponse>> CreateReview(Guid eventId, [FromBody] CreateReviewRequest req)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        try
        {
            var review = await _reviews.CreateReviewAsync(eventId, userId, req);
            return CreatedAtAction(nameof(GetEventReviews), new { eventId }, review);
        }
        catch (ApiException ex)
        {
            return StatusCode(ex.StatusCode, new { code = ex.Code, message = ex.Message });
        }
    }

    [HttpGet("events/{eventId:guid}/reviews")]
    public async Task<ActionResult<List<ReviewResponse>>> GetEventReviews(Guid eventId)
    {
        var reviews = await _reviews.GetEventReviewsAsync(eventId);
        return Ok(reviews);
    }

    [Authorize]
    [HttpGet("events/{eventId:guid}/reviews/my")]
    public async Task<ActionResult> GetMyReviewStatus(Guid eventId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var hasReviewed = await _reviews.HasReviewedAsync(eventId, userId);
        return Ok(new { hasReviewed });
    }

    [HttpGet("users/{organizerId}/reviews")]
    public async Task<ActionResult<OrganizerReviewsResponse>> GetOrganizerReviews(string organizerId)
    {
        var result = await _reviews.GetOrganizerReviewsAsync(organizerId);
        if (result is null) return NotFound(new { message = "Organizer not found." });
        return Ok(result);
    }
}
