using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using VolunteerHub.Api.src.DTO;
using VolunteerHub.Api.src.Entities;
using VolunteerHub.Api.src.Services;
using Microsoft.AspNetCore.Authorization;
using Google.Apis.Auth;



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
    private readonly IConfiguration _config;

    public AuthController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        JwtTokenService jwtTokenService,
        IEmailService emailService,
        IMemoryCache cache,
        IConfiguration config)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwt = jwtTokenService;
        _email = emailService;
        _cache = cache;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return BadRequest(new { error = "Email already in use." });
        }

        var minDob = DateOnly.FromDateTime(DateTime.UtcNow).AddYears(-16);
        if (request.DateOfBirth > minDob)
            return BadRequest(new { error = "You must be at least 16 years old to register." });
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

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> GoogleAuth([FromBody] GoogleAuthRequest request)
    {
        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _config["Google:WebClientId"] }
            });
        }
        catch
        {
            return Unauthorized(new { error = "Invalid Google token." });
        }

        var user = await _userManager.FindByEmailAsync(payload.Email);

        if (user != null)
        {
            if (user.GoogleId == null)
            {
                user.GoogleId = payload.Subject;
                await _userManager.UpdateAsync(user);
            }
        }
        else
        {
            user = new User
            {
                Email = payload.Email,
                UserName = payload.Email,
                FirstName = payload.GivenName ?? "",
                LastName = payload.FamilyName ?? "",
                DateOfBirth = DateOnly.FromDateTime(DateTime.UtcNow),
                GoogleId = payload.Subject
            };

            var result = await _userManager.CreateAsync(user);
            if (!result.Succeeded)
                return BadRequest(new { error = string.Join("; ", result.Errors.Select(e => e.Description)) });

            await _userManager.AddToRoleAsync(user, "User");
        }

        var token = await _jwt.CreateTokenAsync(user);
        var roles = (await _userManager.GetRolesAsync(user)).ToArray();
        return Ok(new AuthResponse(token, user.Id, user.Email ?? "", roles));
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email))
            return BadRequest(new { error = "Email is required." });

        var user = await _userManager.FindByEmailAsync(req.Email.Trim());
        if (user == null)
            return BadRequest(new { error = "No account found with this email address." });

        if (user.PasswordHash == null)
            return BadRequest(new { error = "google_account" });

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