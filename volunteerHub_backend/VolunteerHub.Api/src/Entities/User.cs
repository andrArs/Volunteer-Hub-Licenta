using Microsoft.AspNetCore.Identity;

namespace VolunteerHub.Api.src.Entities
{
    public class User : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateOnly DateOfBirth { get; set; }
        public string? ProfilePicture { get; set; }
        public string? GoogleId { get; set; }
        public string Language { get; set; } = "en";
    }
}