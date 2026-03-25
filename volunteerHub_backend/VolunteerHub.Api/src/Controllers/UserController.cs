using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

    [Authorize]
    [HttpGet]
    public async Task<ActionResult> GetAllUsers()
    {
        var users = await _userManager.Users.ToListAsync();
        var response = users.Select(user => new UserProfileResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email ?? "",
            user.DateOfBirth
        )).ToList();
        return Ok(response);
        
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult> GetUserById(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        return Ok(new UserProfileResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email ?? "",
            user.DateOfBirth
        ));
    }

    [Authorize]
    [HttpPut("{id}")]

    public async Task<ActionResult> UpdateUserProfile(string id, [FromBody] UserProfileResponse updatedProfile)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        user.FirstName = updatedProfile.FirstName;
        user.LastName = updatedProfile.LastName;
        user.Email = updatedProfile.Email;
        user.DateOfBirth = updatedProfile.DateOfBirth ?? user.DateOfBirth;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return NoContent();
    }
}