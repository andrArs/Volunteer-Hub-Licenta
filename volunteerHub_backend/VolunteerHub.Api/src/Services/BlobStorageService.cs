using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace VolunteerHub.Api.src.Services;

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobContainerClient _containerClient;
    private readonly BlobContainerClient _eventImagesContainerClient;

    public BlobStorageService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureStorage:ConnectionString"]!;
        var containerName = configuration["AzureStorage:ContainerName"] ?? "profile-pictures";
        _containerClient = new BlobContainerClient(connectionString, containerName);
        _containerClient.CreateIfNotExists(PublicAccessType.Blob);

        var eventImagesContainerName = configuration["AzureStorage:EventImagesContainerName"] ?? "event-images";
        _eventImagesContainerClient = new BlobContainerClient(connectionString, eventImagesContainerName);
        _eventImagesContainerClient.CreateIfNotExists(PublicAccessType.Blob);
    }

    public async Task<string> UploadProfilePictureAsync(IFormFile file)
    {
        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(extension)) extension = ".jpg";

        var blobName = $"{Guid.NewGuid()}{extension}";
        var blobClient = _containerClient.GetBlobClient(blobName);

        var headers = new BlobHttpHeaders { ContentType = file.ContentType };
        using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, new BlobUploadOptions { HttpHeaders = headers });

        return blobClient.Uri.ToString();
    }

    public async Task DeleteProfilePictureAsync(string blobUrl)
    {
        var blobName = Path.GetFileName(new Uri(blobUrl).LocalPath);
        var blobClient = _containerClient.GetBlobClient(blobName);
        await blobClient.DeleteIfExistsAsync();
    }

    public async Task<string> UploadEventImageAsync(IFormFile file)
    {
        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(extension)) extension = ".jpg";

        var blobName = $"{Guid.NewGuid()}{extension}";
        var blobClient = _eventImagesContainerClient.GetBlobClient(blobName);

        var headers = new BlobHttpHeaders { ContentType = file.ContentType };
        using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, new BlobUploadOptions { HttpHeaders = headers });

        return blobClient.Uri.ToString();
    }

    public async Task DeleteEventImageAsync(string blobUrl)
    {
        var blobName = Path.GetFileName(new Uri(blobUrl).LocalPath);
        var blobClient = _eventImagesContainerClient.GetBlobClient(blobName);
        await blobClient.DeleteIfExistsAsync();
    }
}
