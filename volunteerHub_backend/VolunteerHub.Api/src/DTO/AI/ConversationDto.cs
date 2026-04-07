namespace VolunteerHub.Api.src.DTO.AI;
public record ConversationDto(
    Guid Id,
    DateTime CreatedAt, 
    string? Summary, 
    List<MessageDto> Messages
    );
