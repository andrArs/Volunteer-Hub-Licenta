namespace VolunteerHub.Api.src.DTO.Users;

public record UserProfileResponse(
    string Id,
    string FirstName,
    string LastName,
    string Email,
    DateOnly? DateOfBirth,
    List<string>? Roles = null,
    string? ProfilePictureUrl = null
);

public record UpdateUserRequest(
    string FirstName,
    string LastName,
    string Email,
    DateOnly? DateOfBirth
);
public record UpdateMyProfileRequest(
    string FirstName,
    string LastName,
    DateOnly? DateOfBirth
);

public record UpdateLanguageRequest(string Language);