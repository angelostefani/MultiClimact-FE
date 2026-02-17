using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Net;
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
            [FromQuery] bool simulated)
        {
            var query = new Dictionary<string, string?>
            {
                ["start_date"] = start_date,
                ["end_date"] = end_date,
                ["haztype_id"] = "4",
                ["simulated"] = simulated.ToString().ToLower()
            };

            string serviceUrl = QueryHelpers.AddQueryString("users/system/runs", query);

            _logger.LogInformation("Requesting Extremeprecipitation Service URL: {serviceUrl}", serviceUrl);

            try
            {
                var response = await _httpClient.GetAsync(serviceUrl);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("Extremeprecipitation service response: {responseContent}", content);
                    // Ritorna il payload del servizio così com'è per preservare i nomi dei campi
                    return Content(content, "application/json");
                }

                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    _logger.LogWarning("Extremeprecipitation service returned 404 (no runs found) for requested filters.");
                    return Content("{\"success\":true,\"data\":[]}", "application/json");
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
                ["status_str"] = "completed",
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
                    _logger.LogInformation("Last extremeprecipitation service response: {responseContent}", content);
                    return Content(content, "application/json");
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
