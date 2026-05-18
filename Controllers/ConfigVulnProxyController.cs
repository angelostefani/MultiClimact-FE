using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;


namespace MultiClimact.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ConfigVulnProxyController : ControllerBase 
    {
          
          private readonly HttpClient http;
          private readonly ILogger<ConfigVulnProxyController> logger;
          private readonly IConfiguration configuration;
          

           public ConfigVulnProxyController(HttpClient httpClient, ILogger<ConfigVulnProxyController> logger, IConfiguration configuration) {
                this.http = httpClient;
                this.logger = logger;
                this.configuration = configuration;
           }

        [HttpGet("ws9")]
        public async Task<IActionResult> GetWs9()
        {
            var user_id = GetUserId();
            if (string.IsNullOrWhiteSpace(user_id))
            {
                return BadRequest("Authenticated user id is missing.");
            }

            logger.LogInformation("Fetching vulnerability configs for user {user_id}", user_id);
            var baseUrl = this.configuration["ConfigVulnService:BaseUrl"];
            var url = $"{baseUrl}/users/{Uri.EscapeDataString(user_id)}/configurations";
            logger.LogInformation("Requesting ConfigVulnService at {url}", url);
            HttpResponseMessage response;
            try
            {
                response = await http.GetAsync(url, HttpContext.RequestAborted);
            }
            catch (OperationCanceledException) when (!HttpContext.RequestAborted.IsCancellationRequested)
            {
                logger.LogWarning("ConfigVulnService WS9 timed out at {url}", url);
                return StatusCode(StatusCodes.Status504GatewayTimeout, "WS9 upstream service timed out.");
            }
            catch (HttpRequestException ex)
            {
                logger.LogWarning(ex, "ConfigVulnService WS9 request failed at {url}", url);
                return StatusCode(StatusCodes.Status502BadGateway, "WS9 upstream service is unavailable.");
            }

            var content = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("ConfigVulnService WS9 returned {StatusCode}: {Content}", response.StatusCode, content);
                return StatusCode((int)response.StatusCode, string.IsNullOrWhiteSpace(content) ? "WS9 error" : content);
            }

            logger.LogInformation("Received response from ConfigVulnService: {Content}", content);
            return Content(content, "application/json");
        }



        [HttpPut("ws10")]
        public async Task<IActionResult> PutWs10([FromBody] JsonElement configData)
        {
            var user_id = GetUserId();
            if (string.IsNullOrWhiteSpace(user_id))
            {
                return BadRequest("Authenticated user id is missing.");
            }

            logger.LogInformation("Updating vulnerability configs for user {user_id}", user_id);
            var baseUrl = this.configuration["ConfigVulnService:BaseUrl"];
            var url = $"{baseUrl}/users/{Uri.EscapeDataString(user_id)}/configurations/default";
            logger.LogInformation("Sending update to ConfigVulnService at {url}", url);
            var jsonString = configData.GetRawText();
            var content = new StringContent(jsonString, System.Text.Encoding.UTF8, "application/json");
            var response = await http.PutAsync(url, content, HttpContext.RequestAborted);
            var responseContent = await response.Content.ReadAsStringAsync();
             if (!response.IsSuccessStatusCode)
             return StatusCode((int)response.StatusCode, string.IsNullOrWhiteSpace(responseContent) ? "WS10 error" : responseContent);
            logger.LogInformation("Received response from ConfigVulnService: {ResponseContent}", responseContent);
            return Content(responseContent, "application/json");
        }

        [HttpGet("ws27")]
        public async Task<IActionResult> GetWs27([FromQuery(Name = "haztype_id")] int haztypeId)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest("Authenticated user id is missing.");
            }

            if (!IsSupportedHaztype(haztypeId))
            {
                return BadRequest("Unsupported haztype_id. Allowed values: 1, 2, 4.");
            }

            var baseUrl = configuration["ConfigVulnService:BaseUrl"];
            var pathTemplate = configuration["ConfigVulnService:Ws27PathTemplate"]
                ?? "/users/{id_user}/vulnerability/default";
            var path = pathTemplate
                .Replace("{id_user}", Uri.EscapeDataString(userId), StringComparison.Ordinal)
                .Replace("{userId}", Uri.EscapeDataString(userId), StringComparison.Ordinal);
            var url = QueryHelpers.AddQueryString($"{baseUrl}{path}", "haztype_id", haztypeId.ToString());

            logger.LogInformation("Fetching WS27 default vulnerability config for user {userId}, haztype_id {haztypeId} from {url}", userId, haztypeId, url);

            var response = await http.GetAsync(url, HttpContext.RequestAborted);
            var content = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("ConfigVulnService WS27 returned {StatusCode}: {Content}", response.StatusCode, content);
                return StatusCode((int)response.StatusCode, string.IsNullOrWhiteSpace(content) ? "WS27 error" : content);
            }

            logger.LogInformation("Received WS27 response from ConfigVulnService: {Content}", content);
            return Content(content, "application/json");
        }

        [HttpPut("ws24")]
        public async Task<IActionResult> PutWs24([FromBody] JsonElement requestBody)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest("Authenticated user id is missing.");
            }

            if (!requestBody.TryGetProperty("haztype_id", out var haztypeElement) || haztypeElement.ValueKind != JsonValueKind.Number)
            {
                return BadRequest("The request must include a valid haztype_id.");
            }

            var haztypeId = haztypeElement.GetInt32();
            if (!IsSupportedHaztype(haztypeId))
            {
                return BadRequest("Unsupported haztype_id. Allowed values: 1, 2, 4.");
            }

            var baseUrl = configuration["ConfigVulnService:BaseUrl"];
            var pathTemplate = configuration["ConfigVulnService:Ws24PathTemplate"]
                ?? "/users/{id_user}/vulnerability/default";
            var path = pathTemplate
                .Replace("{id_user}", Uri.EscapeDataString(userId), StringComparison.Ordinal)
                .Replace("{userId}", Uri.EscapeDataString(userId), StringComparison.Ordinal);
            var url = $"{baseUrl}{path}";
            var jsonString = requestBody.GetRawText();
            var content = new StringContent(jsonString, Encoding.UTF8, "application/json");

            logger.LogInformation("Sending WS24 default vulnerability config for user {userId}, haztype_id {haztypeId} to {url}", userId, haztypeId, url);

            var response = await http.PutAsync(url, content, HttpContext.RequestAborted);
            var responseContent = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("ConfigVulnService WS24 returned {StatusCode}: {Content}", response.StatusCode, responseContent);
                return StatusCode((int)response.StatusCode, string.IsNullOrWhiteSpace(responseContent) ? "WS24 error" : responseContent);
            }

            logger.LogInformation("Received WS24 response from ConfigVulnService: {ResponseContent}", responseContent);
            return Content(responseContent, "application/json");
        }

        private string? GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub")
                ?? User.FindFirstValue("oid")
                ?? User.Identity?.Name;
        }

        private static bool IsSupportedHaztype(int haztypeId)
        {
            return haztypeId == 1 || haztypeId == 2 || haztypeId == 4;
        }
    }

}
