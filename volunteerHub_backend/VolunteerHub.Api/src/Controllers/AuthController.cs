using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using VolunteerHub.Api.src.DTO;
using VolunteerHub.Api.src.Entities;
using VolunteerHub.Api.src.Services;
using Microsoft.AspNetCore.Authorization;



namespace VolunteerHub.Api.src.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly JwtTokenService _jwt;

    public AuthController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        JwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwt = jwtTokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return BadRequest(new { error = "Email already in use." });
        }
         var user = new User
         {
            Email = request.Email,
            UserName = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth
        };
         
         var result = await _userManager.CreateAsync(user, request.Password);
         if(!result.Succeeded)
         {
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });
         }
   
        await _userManager.AddToRoleAsync(user, "User");
        var token = await _jwt.CreateTokenAsync(user);
        var roles= (await _userManager.GetRolesAsync(user)).ToArray();
        return Ok(new AuthResponse(token, user.Id, user.Email ?? "", roles.ToArray()));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Unauthorized(new { error = "Invalid credentials" });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
        {
            return Unauthorized(new { error = "Invalid credentials" });
        }
        var token = await _jwt.CreateTokenAsync(user);
        var roles= (await _userManager.GetRolesAsync(user)).ToArray();
        return Ok(new AuthResponse(token, user.Id, user.Email ?? "", roles.ToArray()));
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { message = "Logged out" });
    }

}