namespace VolunteerHub.Api.src.DTO
{
    public record RegisterRequest(
        string FirstName,
        string LastName,
        DateOnly DateOfBirth,
        string Email,
        string Password
    );
}