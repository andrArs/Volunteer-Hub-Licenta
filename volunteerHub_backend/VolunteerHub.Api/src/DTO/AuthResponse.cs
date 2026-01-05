namespace VolunteerHub.Api.src.DTO
{
  public record AuthResponse(
    string Token,
    string UserId,
    string Email,
    string[] Roles
  );
}