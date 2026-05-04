using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;


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
            var response = await http.GetAsync(url, HttpContext.RequestAborted);
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

        private string? GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub")
                ?? User.FindFirstValue("oid")
                ?? User.Identity?.Name;
        }
    }

}
