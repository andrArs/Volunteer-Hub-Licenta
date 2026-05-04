namespace VolunteerHub.Api.src.Services;

public interface IBlobStorageService
{
    Task<string> UploadProfilePictureAsync(IFormFile file);
}
