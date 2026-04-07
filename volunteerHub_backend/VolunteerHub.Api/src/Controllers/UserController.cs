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

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new UserProfileResponse(
            user.Id,
            user.FirstName, 
            user.LastName,
            user.Email ?? "",
            user.DateOfBirth,
            roles.ToList()
        ));
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult> GetAllUsers()
    {
        var users = await _userManager.Users.ToListAsync();
       var response = new List<UserProfileResponse>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            response.Add(new UserProfileResponse(
                user.Id, user.FirstName, user.LastName, user.Email ?? "", user.DateOfBirth, roles.ToList()
            ));
        }
        return Ok(response);
        
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
            roles.ToList()
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

    [Authorize (Roles = "Admin")]
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