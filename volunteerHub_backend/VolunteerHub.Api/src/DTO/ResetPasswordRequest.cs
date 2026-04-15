namespace VolunteerHub.Api.src.DTO;

public record ResetPasswordRequest(
    string Email, 
    string Code, 
    string NewPassword
    );
