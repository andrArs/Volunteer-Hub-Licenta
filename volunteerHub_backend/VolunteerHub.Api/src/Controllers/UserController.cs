using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VolunteerHub.Api.src.DTO.Events;
using VolunteerHub.Api.src.DTO.Users;
using VolunteerHub.Api.src.Entities;
using VolunteerHub.Api.src.Services;

namespace VolunteerHub.Api.src.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly IBlobStorageService _blobStorageService;

    public UsersController(UserManager<User> userManager, IBlobStorageService blobStorageService)
    {
        _userManager = userManager;
        _blobStorageService = blobStorageService;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileResponse>> GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new UserProfileResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email ?? "",
            user.DateOfBirth,
            roles.ToList(),
            user.ProfilePicture
        ));
    }

    [Authorize]
    [HttpPost("me/profile-picture")]
    public async Task<ActionResult> UploadProfilePicture(IFormFile file)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        var url = await _blobStorageService.UploadProfilePictureAsync(file);
        user.ProfilePicture = url;
        await _userManager.UpdateAsync(user);

        return Ok(new { url });
    }

    [Authorize]
    [HttpDelete("me/profile-picture")]
    public async Task<ActionResult> DeleteProfilePicture()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        if (!string.IsNullOrEmpty(user.ProfilePicture))
        {
            await _blobStorageService.DeleteProfilePictureAsync(user.ProfilePicture);
            user.ProfilePicture = null;
            await _userManager.UpdateAsync(user);
        }

        return NoContent();
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult> GetAllUsers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 50) pageSize = 50;

        var query = _userManager.Users.OrderBy(u => u.LastName).ThenBy(u => u.FirstName);

        var totalCount = await query.CountAsync();

        var users = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = new List<UserProfileResponse>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            items.Add(new UserProfileResponse(
                user.Id, user.FirstName, user.LastName, user.Email ?? "", user.DateOfBirth, roles.ToList(), user.ProfilePicture
            ));
        }

        var result = new PagedResult<UserProfileResponse>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<ActionResult> UpdateMyProfile([FromBody] UpdateMyProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.DateOfBirth = request.DateOfBirth ?? user.DateOfBirth;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<ActionResult> GetUserById(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new UserProfileResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email ?? "",
            user.DateOfBirth,
            roles.ToList(),
            user.ProfilePicture
        ));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateUserProfile(string id, [FromBody] UpdateUserRequest updatedProfile)
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

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{id}/roles")]
    public async Task<ActionResult> AssignRole(string id, [FromBody] AssignRoleRequest req)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        if (await _userManager.IsInRoleAsync(user, req.RoleName))
            return BadRequest(new { message = $"User is already in role '{req.RoleName}'." });

        var result = await _userManager.AddToRoleAsync(user, req.RoleName);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}/roles/{roleName}")]
    public async Task<ActionResult> RemoveRole(string id, string roleName)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        if (!await _userManager.IsInRoleAsync(user, roleName))
            return BadRequest(new { message = $"User does not have the role '{roleName}'." });

        var result = await _userManager.RemoveFromRoleAsync(user, roleName);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return NoContent();
    }
}
