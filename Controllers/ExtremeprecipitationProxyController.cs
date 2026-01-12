using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.WebUtilities;
using MultiClimact.Models;
using MultiClimact.Services;

namespace MultiClimact.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExtremeprecipitationProxyController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ExtremeprecipitationProxyController> _logger;

        public ExtremeprecipitationProxyController(ExtremeprecipitationServiceClient client, ILogger<ExtremeprecipitationProxyController> logger)
        {
            _httpClient = client.HttpClient;
            _logger = logger;
        }

        [HttpGet("GetExtremeprecipitations")]
        public async Task<IActionResult> GetExtremeprecipitations(
            [FromQuery] string user_id,
            [FromQuery] string start_date,
            [FromQuery] string end_date,
            [FromQuery] string min_precipitation,
            [FromQuery] string max_precipitation,
            [FromQuery] bool simulated)
        {
            var query = new Dictionary<string, string?>
            {
                ["simulated"] = simulated.ToString().ToLower(),
                ["status"] = "completed",
                ["min_precipitation"] = min_precipitation,
                ["event_date_min"] = start_date,
                ["event_date_max"] = end_date,
                ["run_end_max"] = "2026-12-31"
            };

            string serviceUrl = QueryHelpers.AddQueryString("users/system/extremeprecipitations", query);

            _logger.LogInformation("Requesting Extremeprecipitation Service URL: {serviceUrl}", serviceUrl);

            try
            {
                var response = await _httpClient.GetAsync(serviceUrl);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var jsonResponse = JsonConvert.DeserializeObject<ExtremeprecipitationResponse>(content);
                    return Ok(jsonResponse);
                }

                _logger.LogError("Errore Extremeprecipitation Service: {statusCode}", response.StatusCode);
                return StatusCode((int)response.StatusCode, "Errore nella richiesta al servizio extreme precipitation");
            }
            catch (HttpRequestException e)
            {
                _logger.LogError("Errore nella chiamata al servizio extreme precipitation: {message}", e.Message);
                return StatusCode(500, $"Errore nella chiamata al servizio extreme precipitation: {e.Message}");
            }
        }

        [HttpGet("GetLastExtremeprecipitation")]
        public async Task<IActionResult> GetLastExtremeprecipitation()
        {
            var query = new Dictionary<string, string?>
            {
                ["status_str"] = "submitted",
                ["haztype_id"] = "4"
            };

            string serviceUrl = QueryHelpers.AddQueryString("users/system/last_id_run", query);

            _logger.LogInformation("Requesting LastExtremeprecipitation Service URL: {serviceUrl}", serviceUrl);

            try
            {
                var response = await _httpClient.GetAsync(serviceUrl);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var jsonResponse = JsonConvert.DeserializeObject<LastExtremeprecipitationResponse>(content);
                    return Ok(jsonResponse);
                }

                _logger.LogError("Errore LastExtremeprecipitation Service: {statusCode}", response.StatusCode);
                return StatusCode((int)response.StatusCode, "Errore nella richiesta al servizio extreme precipitation");
            }
            catch (HttpRequestException e)
            {
                _logger.LogError("Errore nella chiamata al servizio extreme precipitation: {message}", e.Message);
                return StatusCode(500, $"Errore nella chiamata al servizio extreme precipitation: {e.Message}");
            }
        }
    }
}
