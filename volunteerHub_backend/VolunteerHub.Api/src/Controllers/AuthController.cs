using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
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
    private readonly IEmailService _email;
    private readonly IMemoryCache _cache;

    public AuthController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        JwtTokenService jwtTokenService,
        IEmailService emailService,
        IMemoryCache cache)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwt = jwtTokenService;
        _email = emailService;
        _cache = cache;
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

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email))
            return BadRequest(new { error = "Email is required." });

        var user = await _userManager.FindByEmailAsync(req.Email.Trim());
        if (user == null)
            return BadRequest(new { error = "No account found with this email address." });

        var code = Random.Shared.Next(100000, 999999).ToString();
        _cache.Set($"pwd_reset_{req.Email.Trim().ToLower()}", code, TimeSpan.FromMinutes(15));

        try
        {
            await _email.SendAsync(
                req.Email,
                "VolunteerHub - Password Reset Code",
                $"Your password reset code is: {code}\n\nThis code expires in 15 minutes.\nIf you didn't request this, ignore this email."
            );
        }
        catch
        {
            _cache.Remove($"pwd_reset_{req.Email.Trim().ToLower()}");
            return StatusCode(500, new { error = "Failed to send email. Please try again." });
        }

        return Ok(new { message = "Reset code sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        var cacheKey = $"pwd_reset_{req.Email.Trim().ToLower()}";
        if (!_cache.TryGetValue(cacheKey, out string? storedCode) || storedCode != req.Code)
            return BadRequest(new { error = "Invalid or expired code." });

        var user = await _userManager.FindByEmailAsync(req.Email);
        if (user == null)
            return BadRequest(new { error = "Invalid or expired code." });

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, req.NewPassword);

        if (!result.Succeeded)
            return BadRequest(new { error = string.Join("; ", result.Errors.Select(e => e.Description)) });

        _cache.Remove(cacheKey);
        return Ok(new { message = "Password reset successful." });
    }

}