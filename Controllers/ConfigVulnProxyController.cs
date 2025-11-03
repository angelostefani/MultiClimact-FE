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


namespace MultiClimact.Controllers
{
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
           public async Task<JsonResult> GetWs9(){
                var user_id = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier)?? User.FindFirstValue("sub") ?? User.FindFirstValue("oid");
                var baseUrl = this.configuration["ConfigVulnService:BaseUrl"];
                var url = $"{baseUrl.TrimEnd('/')}/users/{Uri.EscapeDataString(user_id)}/configurations";
                 logger.LogInformation("Requesting ConfigVulnService at {url}", url);
                var response = await http.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonContent = JObject.Parse(content);
                logger.LogInformation("Received response from ConfigVulnService: {jsonContent}", jsonContent.ToString());
                return new JsonResult(jsonContent);
           }
    }



}