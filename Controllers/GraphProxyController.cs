using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using MultiClimact.Services;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MultiClimact.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GraphProxyController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<GraphProxyController> _logger;

        public GraphProxyController(GraphServiceClient client, ILogger<GraphProxyController> logger)
        {
            _httpClient = client.HttpClient;
            _logger = logger;
        }

        [HttpGet("GetGraphs")]
        public async Task<IActionResult> GetGraphs(
            [FromQuery] string? user_id,
            [FromQuery] string? start_time,
            [FromQuery] string? end_time,
            [FromQuery] string? name,
            [FromQuery] int? id_conf,
            [FromQuery] int? status_id)
        {
            var idUser = string.IsNullOrWhiteSpace(user_id) ? "system" : user_id;
            var query = new Dictionary<string, string?>();

            query["user_id"] = idUser;

            if (!string.IsNullOrWhiteSpace(start_time))
            {
                query["start_time"] = start_time;
            }

            if (!string.IsNullOrWhiteSpace(end_time))
            {
                query["end_time"] = end_time;
            }

            if (!string.IsNullOrWhiteSpace(name))
            {
                query["name"] = name;
            }

            if (id_conf.HasValue && id_conf.Value > 0)
            {
                query["id_conf"] = id_conf.Value.ToString();
            }

            if (status_id.HasValue && status_id.Value > 0)
            {
                query["status_id"] = status_id.Value.ToString();
            }

            var servicePath = "scenarios";
            var serviceUrl = query.Count > 0
                ? QueryHelpers.AddQueryString(servicePath, query)
                : servicePath;

            _logger.LogInformation("Requesting Graph Service URL: {serviceUrl}", serviceUrl);

            try
            {
                var response = await _httpClient.GetAsync(serviceUrl);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Content(content, "application/json");
                }

                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    _logger.LogWarning("Graph service returned 404 (no graphs found) for requested filters.");
                    return Content("{\"success\":true,\"data\":[]}", "application/json");
                }

                _logger.LogError("Error Graph Service: {statusCode}", response.StatusCode);
                return StatusCode((int)response.StatusCode, "Error requesting graph service");
            }
            catch (HttpRequestException e)
            {
                _logger.LogError("Error while calling graph service: {message}", e.Message);
                return StatusCode(500, $"Error while calling graph service: {e.Message}");
            }
        }

        [HttpPost("CreateGraph")]
        public async Task<IActionResult> CreateGraph(
            [FromBody] JsonElement configuration,
            [FromQuery] string? user_id)
        {
            var idUser = string.IsNullOrWhiteSpace(user_id) ? "system" : user_id;
            var servicePath = $"users/{idUser}/scenario/submit";
            var payload = configuration.GetRawText();
            var content = new StringContent(payload, Encoding.UTF8, "application/json");

            _logger.LogInformation("Posting graph configuration to Graph Service URL: {servicePath}", servicePath);

            try
            {
                var response = await _httpClient.PostAsync(servicePath, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    if (string.IsNullOrWhiteSpace(responseContent))
                    {
                        return Ok(new { success = true });
                    }

                    return Content(responseContent, "application/json");
                }

                _logger.LogError("Error CreateGraph Service: {statusCode}", response.StatusCode);
                return StatusCode((int)response.StatusCode,
                    string.IsNullOrWhiteSpace(responseContent) ? "Error creating graph" : responseContent);
            }
            catch (HttpRequestException e)
            {
                _logger.LogError("Error while calling CreateGraph service: {message}", e.Message);
                return StatusCode(500, $"Error while calling graph service: {e.Message}");
            }
        }

        [HttpGet("GetDefaultScenario")]
        public async Task<IActionResult> GetDefaultScenario([FromQuery] string? user_id)
        {
            var idUser = string.IsNullOrWhiteSpace(user_id) ? "system" : user_id;
            var servicePath = $"users/{idUser}/scenario/default";

            _logger.LogInformation("Requesting Default Scenario Service URL: {servicePath}", servicePath);

            try
            {
                var response = await _httpClient.GetAsync(servicePath);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Content(content, "application/json");
                }

                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    _logger.LogWarning("Default scenario not found for user {idUser}.", idUser);
                    return NotFound();
                }

                _logger.LogError("Error GetDefaultScenario Service: {statusCode}", response.StatusCode);
                return StatusCode((int)response.StatusCode, "Error requesting default scenario service");
            }
            catch (HttpRequestException e)
            {
                _logger.LogError("Error while calling default scenario service: {message}", e.Message);
                return StatusCode(500, $"Error while calling default scenario service: {e.Message}");
            }
        }

        [HttpPost("LogScenarioSetup")]
        public IActionResult LogScenarioSetup([FromBody] JsonElement configuration)
        {
            _logger.LogInformation("Scenario Setup transient JSON: {payload}", configuration.GetRawText());
            return Ok(new { success = true });
        }
    }
}
