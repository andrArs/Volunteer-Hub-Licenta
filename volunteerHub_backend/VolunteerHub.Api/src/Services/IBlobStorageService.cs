namespace VolunteerHub.Api.src.Services;

public interface IBlobStorageService
{
    Task<string> UploadProfilePictureAsync(IFormFile file);
    Task DeleteProfilePictureAsync(string blobUrl);
    Task<string> UploadEventImageAsync(IFormFile file);
    Task DeleteEventImageAsync(string blobUrl);
}
