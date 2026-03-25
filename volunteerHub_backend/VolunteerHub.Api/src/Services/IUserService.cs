using VolunteerHub.Api.src.DTO.Users;

namespace VolunteerHub.Api.src.Services;

public interface IUserService
{
    Task<List<UserProfileResponse>> GetAllUsersAsync();
    Task<UserProfileResponse?> GetUserByIdAsync(string id);
    Task<bool> UpdateUserProfileAsync(string id, UserProfileResponse updatedProfile);
    Task<bool> DeleteUserAsync(string id);
}