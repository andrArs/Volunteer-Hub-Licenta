namespace VolunteerHub.Api.src.DTO.Users;

public record UserProfileResponse(
    string Id,
    string FirstName,
    string LastName,
    string Email,
    DateOnly? DateOfBirth 
);