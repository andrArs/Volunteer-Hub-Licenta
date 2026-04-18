using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VolunteerHub.Api.src.Entities;

public class Review
{
    [Key]
    public Guid Id { get; set; }

    public Guid EventId { get; set; }
    public Event Event { get; set; } = null!;

    public string ReviewerId { get; set; } = "";
    public User Reviewer { get; set; } = null!;

    public string OrganizerId { get; set; } = "";
    public User Organizer { get; set; } = null!;

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
