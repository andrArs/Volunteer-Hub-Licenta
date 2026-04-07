using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VolunteerHub.Api.src.DTO.AI;
using VolunteerHub.Api.src.Services;
using VolunteerHub.Api.src.Exceptions;

namespace VolunteerHub.Api.src.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;

    public AiController(IAiService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("chat")]
    public async Task<ActionResult<AiChatResponse>> Chat([FromBody] AiChatRequest req)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        try
        {
            var response = await _aiService.GetChatResponseAsync(userId, req);
            return Ok(response);
        }
        catch (ApiException ex)
        {
            return StatusCode(ex.StatusCode, new { code = ex.Code, message = ex.Message });
        }
    }

    [HttpGet("conversations")]
    public async Task<ActionResult<List<ConversationDto>>> GetConversations()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _aiService.GetConversationsAsync(userId);
        return Ok(result);
    }

    [HttpGet("conversations/{conversationId:guid}")]
    public async Task<ActionResult<ConversationDto>> GetConversation(Guid conversationId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        try
        {
            var result = await _aiService.GetConversationAsync(userId, conversationId);
            return Ok(result);
        }
        catch (ApiException ex)
        {
            return StatusCode(ex.StatusCode, new { code = ex.Code, message = ex.Message });
        }
    }

    [HttpDelete("conversations/{conversationId:guid}")]
    public async Task<IActionResult> DeleteConversation(Guid conversationId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        try
        {
            await _aiService.DeleteConversationAsync(userId, conversationId);
            return NoContent();
        }
        catch (ApiException ex)
        {
            return StatusCode(ex.StatusCode, new { code = ex.Code, message = ex.Message });
        }
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);
}