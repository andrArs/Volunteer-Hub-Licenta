namespace VolunteerHub.Api.src.DTO.AI;
public record ConversationDto(
    Guid Id,
    DateTime CreatedAt,
    String? Title, 
    string? Summary, 
    List<MessageDto> Messages
    );
