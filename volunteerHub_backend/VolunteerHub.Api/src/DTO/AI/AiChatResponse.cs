namespace VolunteerHub.Api.src.DTO.AI;
public record AiChatResponse(
    string Reply,
    Guid ConversationId
    );