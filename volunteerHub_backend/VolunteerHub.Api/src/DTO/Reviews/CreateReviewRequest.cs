using System.ComponentModel.DataAnnotations;

namespace VolunteerHub.Api.src.DTO.Reviews;

public class CreateReviewRequest
{
    [Required, Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }
}
