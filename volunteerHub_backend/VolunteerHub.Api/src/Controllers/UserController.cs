using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VolunteerHub.Api.src.DTO.Users;
using VolunteerHub.Api.src.Entities; 

namespace VolunteerHub.Api.src.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> _userManager;

    public UsersController(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileResponse>> GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        return Ok(new UserProfileResponse(
            user.Id,
            user.FirstName, 
            user.LastName,
            user.Email ?? "",
            user.DateOfBirth
        ));
    }
}