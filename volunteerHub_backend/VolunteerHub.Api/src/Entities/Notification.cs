using System.ComponentModel.DataAnnotations;

namespace VolunteerHub.Api.src.Entities;

public class Notification
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public string UserId { get; set; } = "";
    public User? User { get; set; }

    public Guid? EventId { get; set; }
    public Event? Event { get; set; }

    [Required, MaxLength(2000)]
    public string Message { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsRead { get; set; } = false;
}
