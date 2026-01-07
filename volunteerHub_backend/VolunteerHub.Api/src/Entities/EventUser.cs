using System.ComponentModel.DataAnnotations;
using VolunteerHub.Api.src.Entities;
using VolunteerHub.Api.src.Entities.Enum;

public class UserEvent
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public string UserId { get; set; } = "";
    public User User { get; set; } = null!;

    [Required]
    public Guid EventId { get; set; }
    public Event Event { get; set; } = null!;

    [Required]
    public UserEventStatus Status { get; set; }

    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
}