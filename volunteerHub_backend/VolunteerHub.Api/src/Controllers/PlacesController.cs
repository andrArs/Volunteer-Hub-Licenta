using Microsoft.AspNetCore.Mvc;

namespace VolunteerHub.Api.src.Controllers;

[ApiController]
[Route("api/places")]
public class PlacesController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;

    public PlacesController(IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet("autocomplete")]
    public async Task<ActionResult> Autocomplete([FromQuery] string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return BadRequest(new { message = "Input is required." });

        var apiKey = _config["MapSettings:GoogleMapsApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            return StatusCode(500, new { message = "Google Maps API key not configured." });

        var url = $"https://maps.googleapis.com/maps/api/place/autocomplete/json?input={Uri.EscapeDataString(input)}&key={apiKey}";

        var client = _httpClientFactory.CreateClient();
        var response = await client.GetStringAsync(url);

        return Content(response, "application/json");
    }

    [HttpGet("details")]
    public async Task<ActionResult> Details([FromQuery] string placeId)
    {
        if (string.IsNullOrWhiteSpace(placeId))
            return BadRequest(new { message = "PlaceId is required." });

        var apiKey = _config["MapSettings:GoogleMapsApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            return StatusCode(500, new { message = "Google Maps API key not configured." });

        var url = $"https://maps.googleapis.com/maps/api/place/details/json?placeid={Uri.EscapeDataString(placeId)}&key={apiKey}";

        var client = _httpClientFactory.CreateClient();
        var response = await client.GetStringAsync(url);

        return Content(response, "application/json");
    }
}
