using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VolunteerHub.Api.src.Data;
using VolunteerHub.Api.src.DTO.AI;
using VolunteerHub.Api.src.Entities;
using VolunteerHub.Api.src.Entities.Enum;
using VolunteerHub.Api.src.Exceptions;

namespace VolunteerHub.Api.src.Services;

public class AiService : IAiService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;

    private int MaxHistoryMessages => _config.GetValue<int>("AiSettings:MaxHistoryMessages", 10);
    private int SummaryThreshold => _config.GetValue<int>("AiSettings:SummaryThreshold", 20);
    private string GeminiApiKey => _config["AiSettings:GeminiApiKey"] ?? throw new ApiException(500, "missing_api_key", "AI API Key is not configured.");
    private const string GeminiModel = "gemini-2.0-flash-lite-001";

    public AiService(AppDbContext db, IConfiguration config, HttpClient httpClient)
    {
        _db = db;
        _config = config;
        _httpClient = httpClient;
    }

    public async Task<AiChatResponse> GetChatResponseAsync(string userId, AiChatRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Message))
            throw new ApiException(400, "empty_message", "Message cannot be empty.");

        AiConversation conversation;
        if (req.ConversationId.HasValue)
        {
            conversation = await _db.AiConversations
                .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
                .FirstOrDefaultAsync(c => c.Id == req.ConversationId && c.UserId == userId)
                ?? throw new ApiException(404, "conversation_not_found", "Conversation not found.");
        }
        else
        {
            conversation = new AiConversation { UserId = userId };
            _db.AiConversations.Add(conversation);
            await _db.SaveChangesAsync();
        }

        var systemPrompt = await BuildSystemPromptAsync(userId);

        var contents = BuildContents(conversation, req.Message);

        var aiReply = await CallGeminiAsync(systemPrompt, contents);

        var userMsg = new AiMessage
        {
            ConversationId = conversation.Id,
            Role = "user",
            Content = req.Message,
            CreatedAt = DateTime.UtcNow
        };

        var botMsg = new AiMessage
        {
            ConversationId = conversation.Id,
            Role = "model",
            Content = aiReply,
            CreatedAt = DateTime.UtcNow
        };

        _db.AiMessages.AddRange(userMsg, botMsg);
        await _db.SaveChangesAsync();

        try 
        { 
            await MaybeSummarizeAsync(conversation.Id); 
        }
        catch 
        { 
            /* log here if you have ILogger */ 
        }

        return new AiChatResponse(aiReply, conversation.Id);
    }

    public async Task<List<ConversationDto>> GetConversationsAsync(string userId)
    {
        var conversations = await _db.AiConversations
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new ConversationDto(
                c.Id,
                c.CreatedAt,
                c.Summary,
                c.Messages
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => new MessageDto(m.Id, m.Role, m.Content, m.CreatedAt))
                    .ToList()
            ))
            .ToListAsync();

        return conversations;
    }

    public async Task<ConversationDto> GetConversationAsync(string userId, Guid conversationId)
    {
        var conversation = await _db.AiConversations
            .AsNoTracking()
            .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId)
            ?? throw new ApiException(404, "conversation_not_found", "Conversation not found.");

        return new ConversationDto(
            conversation.Id,
            conversation.CreatedAt,
            conversation.Summary,
            conversation.Messages
                .Select(m => new MessageDto(m.Id, m.Role, m.Content, m.CreatedAt))
                .ToList()
        );
    }

    public async Task DeleteConversationAsync(string userId, Guid conversationId)
    {
        var conversation = await _db.AiConversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId)
            ?? throw new ApiException(404, "conversation_not_found", "Conversation not found.");

        _db.AiConversations.Remove(conversation);
        await _db.SaveChangesAsync();
    }


    private async Task<string> BuildSystemPromptAsync(string userId)
    {
        var now = DateTime.UtcNow;

        var upcomingEvents = await _db.Events.AsNoTracking()
        .Where(e => e.Status == EventStatus.Approved && e.StartDateTime >= now)
        .OrderBy(e => e.StartDateTime)
        .Take(20) 
        .Select(e => new { e.Id, e.Title, e.Category, e.LocationName, e.StartDateTime })
        .ToListAsync();

        var userCategories = await _db.UserEvents.AsNoTracking()
            .Where(ue => ue.UserId == userId &&
                   (ue.Status == UserEventStatus.Going || ue.Status == UserEventStatus.Interested))
            .Select(ue => ue.Event.Category.ToString())
            .Distinct()
            .ToListAsync();

        var userPrefs = userCategories.Any()
            ? string.Join(", ", userCategories)
            : "No specific preferences yet.";

        var eventsJson = JsonSerializer.Serialize(upcomingEvents);

        return $@"You are the virtual assistant for the VolunteerHub app.
                Strict Rules:
                1. ONLY recommend events from this provided JSON list: {eventsJson}
                2. User's preferred categories based on history: {userPrefs}. If the user doesn't ask for something specific, suggest 3 new events (ideally from these categories).
                3. If the user asks for specific criteria (e.g., 'today', 'animals', 'Bucharest'), filter strictly from the list above.
                4. Do not hallucinate or invent events. If no suitable event is found, apologize politely and offer available alternatives from the list.
                5. IMPORTANT: WHEN RECOMMENDING AN EVENT, you MUST add this exact text on a new line at the end of that event's description: [EVENT_CARD: event_id_here] (example: [EVENT_CARD: 12345678-1234-1234-1234-123456789012]).
                6. IMPORTANT: If the user says they want to join, attend, sign up, or mark interest in a specific event (e.g. 'I want to go to X', 'add me as interested in Y', 'sign me up for Z'), you MUST reply with ONLY this tag on a new line: [JOIN_EVENT: event_id_here | going] or [JOIN_EVENT: event_id_here | interested] depending on their intent. Do NOT add this tag unless the user explicitly asks to join/attend/be interested.
                7. IMPORTANT: If the user wants to remove/cancel/leave an event they joined, reply with: [REMOVE_EVENT: event_id_here]. Do NOT add unless explicitly asked to remove/cancel.
                8. NEVER expose raw UUIDs in your text responses. Refer to events only by their title.
                Be concise, friendly, use emojis, and ALWAYS reply in the same language the user used to ask the question.";
    }

    private List<object> BuildContents(AiConversation conversation, string newMessage)
    {
        var contents = new List<object>();

        if (!string.IsNullOrEmpty(conversation.Summary))
        {
            contents.Add(new
            {
                role = "user",
                parts = new[] { new { text = $"[Summary of our earlier conversation: {conversation.Summary}]" } }
            });
            contents.Add(new
            {
                role = "model",
                parts = new[] { new { text = "Got it, I have the context from our earlier discussion." } }
            });
        }

        var recentMessages = conversation.Messages
            .OrderBy(m => m.CreatedAt)
            .TakeLast(MaxHistoryMessages)
            .ToList();

        foreach (var msg in recentMessages)
        {
            contents.Add(new
            {
                role = msg.Role,
                parts = new[] { new { text = msg.Content } }
            });
        }

        contents.Add(new
        {
            role = "user",
            parts = new[] { new { text = newMessage } }
        });

        return contents;
    }

    private async Task<string> CallGeminiAsync(string systemPrompt, List<object> contents)
    {
        var geminiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key={GeminiApiKey}";        var payload = new
        {
            system_instruction = new { parts = new[] { new { text = systemPrompt } } },
            contents
        };

        var httpContent = new StringContent(
            JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _httpClient.PostAsync(geminiUrl, httpContent);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new ApiException(500, "ai_error", $"Gemini API error: {error}");
        }

        var responseData = await response.Content.ReadFromJsonAsync<JsonElement>();
        return responseData
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString()
            ?? "I could not formulate a response.";
    }

    private async Task MaybeSummarizeAsync(Guid conversationId)
    {
       // await using var scope = _db.Database.BeginTransactionAsync();

        var conversation = await _db.AiConversations
            .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (conversation == null) return;

        var messages = conversation.Messages.OrderBy(m => m.CreatedAt).ToList();
        if (messages.Count < SummaryThreshold) return;

        var toSummarize = messages.Take(messages.Count - MaxHistoryMessages).ToList();

        var historyText = string.Join("\n", toSummarize
            .Select(m => $"{m.Role}: {m.Content}"));

        var summaryPrompt = $@"Summarize this conversation briefly in 3-5 sentences. 
                              Focus on: user preferences, events discussed, and any decisions made.
                              Previous summary (if any): {conversation.Summary ?? "none"}
                              Conversation to summarize:
                              {historyText}
                              Reply ONLY with the summary text, nothing else.";

        var summaryContents = new List<object>
        {
            new { role = "user", parts = new[] { new { text = summaryPrompt } } }
        };

        try
        {
            var newSummary = await CallGeminiAsync(string.Empty, summaryContents);
            conversation.Summary = newSummary;
            _db.AiMessages.RemoveRange(toSummarize);
            await _db.SaveChangesAsync();
        }
        catch
        {
        }
    }
}