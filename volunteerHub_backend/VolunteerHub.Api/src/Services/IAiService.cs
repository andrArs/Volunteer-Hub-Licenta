using VolunteerHub.Api.src.DTO.AI;

namespace VolunteerHub.Api.src.Services;

public interface IAiService
{
    Task<AiChatResponse> GetChatResponseAsync(string userId, AiChatRequest req);
    Task<List<ConversationDto>> GetConversationsAsync(string userId);
    Task<ConversationDto> GetConversationAsync(string userId, Guid conversationId);
    Task DeleteConversationAsync(string userId, Guid conversationId);
}