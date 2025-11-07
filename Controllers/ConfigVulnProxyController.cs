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
           public async Task<IActionResult> GetWs9(){
               var user_id = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? User.FindFirstValue("oid");
                logger.LogInformation("Fetching vulnerability configs for user {user_id}", user_id);
                var baseUrl = this.configuration["ConfigVulnService:BaseUrl"];
                var url = $"{baseUrl}/users/system/configurations";
                logger.LogInformation("Requesting ConfigVulnService at {url}", url);
                var response = await http.GetAsync(url);
                response.EnsureSuccessStatusCode();
                //{Uri.EscapeDataString(user_id)}
                var content = await response.Content.ReadAsStringAsync();
                logger.LogInformation("Received response from ConfigVulnService: {Content}", content);
                return Content(content, "application/json");
           }
    }



}