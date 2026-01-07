using System.ComponentModel.DataAnnotations;
using VolunteerHub.Api.src.Entities.Enum;

namespace VolunteerHub.Api.src.Entities;

public class Event
{
    [Key]
    public Guid Id { get; set; }

    [Required, MaxLength(200)]
    public string Title {get;set;}="";

    [Required, MaxLength(2000)]
    public string Description {get;set;}="";

    [Required]
    public EventCategory Category {get;set;}

    [Required]
    public DateTime StartDateTime {get;set;}
    public DateTime EndDateTime {get;set;}

    [Required, MaxLength(300)]
    public string LocationName {get;set;}="";
    [Required, MaxLength(500)]
    public string Address {get;set;}="";
    public double Latitude {get;set;}
    public double Longitude {get;set;}
    public int MaxVolunteers {get;set;}

    [Required]
    public EventStatus Status {get;set;} = EventStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public string CreatedById { get; set; } = "";
    public User CreatedBy { get; set; } = null!;

    public ICollection<UserEvent> UserEvents { get; set; } = new List<UserEvent>();

}