using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace VolunteerHub.Api.src.Services;

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobContainerClient _containerClient;

    public BlobStorageService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureStorage:ConnectionString"]!;
        var containerName = configuration["AzureStorage:ContainerName"] ?? "profile-pictures";
        _containerClient = new BlobContainerClient(connectionString, containerName);
        _containerClient.CreateIfNotExists(PublicAccessType.Blob);
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
}
