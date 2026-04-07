namespace VolunteerHub.Api.src.DTO.AI;
public record MessageDto(
    Guid Id, 
    string Role, 
    string Content, 
    DateTime CreatedAt
    );
