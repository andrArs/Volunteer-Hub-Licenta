namespace VolunteerHub.Api.src.Entities;
public class AiConversation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;
    public string? Title { get; set; }
    public string? Summary { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<AiMessage> Messages { get; set; } = new List<AiMessage>();
}
