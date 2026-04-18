using Microsoft.EntityFrameworkCore;
using VolunteerHub.Api.src.Data;
using VolunteerHub.Api.src.DTO.Reviews;
using VolunteerHub.Api.src.Entities;
using VolunteerHub.Api.src.Entities.Enum;
using VolunteerHub.Api.src.Exceptions;

namespace VolunteerHub.Api.src.Services;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _db;

    public ReviewService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ReviewResponse> CreateReviewAsync(Guid eventId, string reviewerId, CreateReviewRequest req)
    {
        var ev = await _db.Events.AsNoTracking().FirstOrDefaultAsync(e => e.Id == eventId)
            ?? throw new ApiException(404, "event_not_found", "Event not found.");

        if (ev.EndDateTime > DateTime.UtcNow)
            throw new ApiException(400, "event_not_ended", "You can only review events that have already ended.");

        var attended = await _db.UserEvents.AnyAsync(ue =>
            ue.EventId == eventId &&
            ue.UserId == reviewerId &&
            ue.Status == UserEventStatus.Going);

        if (!attended)
            throw new ApiException(403, "not_attended", "You can only review events you attended.");

        if (ev.CreatedById == reviewerId)
            throw new ApiException(403, "own_event", "You cannot review your own event.");

        var alreadyReviewed = await _db.Reviews.AnyAsync(r => r.EventId == eventId && r.ReviewerId == reviewerId);
        if (alreadyReviewed)
            throw new ApiException(409, "already_reviewed", "You have already reviewed this event.");

        var reviewer = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == reviewerId)
            ?? throw new ApiException(404, "user_not_found", "Reviewer not found.");

        var review = new Review
        {
            Id = Guid.NewGuid(),
            EventId = eventId,
            ReviewerId = reviewerId,
            OrganizerId = ev.CreatedById,
            Rating = req.Rating,
            Comment = req.Comment?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        return new ReviewResponse(
            review.Id,
            ev.Id,
            ev.Title,
            reviewerId,
            reviewer.FirstName + " " + reviewer.LastName,
            ev.CreatedById,
            review.Rating,
            review.Comment,
            review.CreatedAt
        );
    }

    public async Task<List<ReviewResponse>> GetEventReviewsAsync(Guid eventId)
    {
        return await _db.Reviews
            .AsNoTracking()
            .Where(r => r.EventId == eventId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewResponse(
                r.Id,
                r.EventId,
                r.Event.Title,
                r.ReviewerId,
                r.Reviewer.FirstName + " " + r.Reviewer.LastName,
                r.OrganizerId,
                r.Rating,
                r.Comment,
                r.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<bool> HasReviewedAsync(Guid eventId, string reviewerId)
    {
        return await _db.Reviews.AnyAsync(r => r.EventId == eventId && r.ReviewerId == reviewerId);
    }

    public async Task<OrganizerReviewsResponse?> GetOrganizerReviewsAsync(string organizerId)
    {
        var organizer = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == organizerId);
        if (organizer is null) return null;

        var reviews = await _db.Reviews
            .AsNoTracking()
            .Where(r => r.OrganizerId == organizerId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewResponse(
                r.Id,
                r.EventId,
                r.Event.Title,
                r.ReviewerId,
                r.Reviewer.FirstName + " " + r.Reviewer.LastName,
                r.OrganizerId,
                r.Rating,
                r.Comment,
                r.CreatedAt
            ))
            .ToListAsync();

        var avg = reviews.Count > 0 ? reviews.Average(r => r.Rating) : 0.0;

        return new OrganizerReviewsResponse(
            organizerId,
            organizer.FirstName + " " + organizer.LastName,
            Math.Round(avg, 1),
            reviews.Count,
            reviews
        );
    }
}
