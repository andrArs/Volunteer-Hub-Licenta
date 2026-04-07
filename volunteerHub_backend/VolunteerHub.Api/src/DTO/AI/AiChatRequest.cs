namespace VolunteerHub.Api.src.DTO.AI;
public record AiChatRequest(
    string Message,
    Guid? ConversationId
    );