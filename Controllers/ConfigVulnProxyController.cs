using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Xml;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
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
            var user_id = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? User.FindFirstValue("oid");
            logger.LogInformation("Fetching vulnerability configs for user {user_id}", user_id);
            var baseUrl = this.configuration["ConfigVulnService:BaseUrl"];
            var url = $"{baseUrl}/users/{Uri.EscapeDataString(user_id)}/configurations";
            logger.LogInformation("Requesting ConfigVulnService at {url}", url);
            var response = await http.GetAsync(url);
            response.EnsureSuccessStatusCode();
            //{Uri.EscapeDataString(user_id)}
            var content = await response.Content.ReadAsStringAsync();
            logger.LogInformation("Received response from ConfigVulnService: {Content}", content);
            return Content(content, "application/json");
        }



        [HttpPut("ws10")]
        public async Task<IActionResult> PutWs10([FromBody] JsonElement configData)
        {
            var user_id = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? User.FindFirstValue("oid");
            logger.LogInformation("Updating vulnerability configs for user {user_id}", user_id);
            var baseUrl = this.configuration["ConfigVulnService:BaseUrl"];
            var url = $"{baseUrl}/users/{Uri.EscapeDataString(user_id)}/configurations/default";
            //{Uri.EscapeDataString(user_id)}
            logger.LogInformation("Sending update to ConfigVulnService at {url}", url);
            var jsonString = configData.GetRawText();
            var content = new StringContent(jsonString, System.Text.Encoding.UTF8, "application/json");
            var response = await http.PutAsync(url, content);
            var responseContent = await response.Content.ReadAsStringAsync();
             if (!response.IsSuccessStatusCode)
             return StatusCode((int)response.StatusCode, string.IsNullOrWhiteSpace(responseContent) ? "WS10 error" : responseContent);
            logger.LogInformation("Received response from ConfigVulnService: {ResponseContent}", responseContent);
            return Content(responseContent, "application/json");
        }
    }

}