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
    public class HeatwaveProxyController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<HeatwaveProxyController> _logger;

        public HeatwaveProxyController(HeatwaveServiceClient client, ILogger<HeatwaveProxyController> logger)
        {
            _httpClient = client.HttpClient;
            _logger = logger;
        }

        [HttpGet("GetHeatwaves")]
        public async Task<IActionResult> GetHeatwaves(
            [FromQuery] string user_id,
            [FromQuery] string start_date,
            [FromQuery] string end_date,
            [FromQuery] string? min_temperature,
            [FromQuery] string? max_temperature,
            [FromQuery] bool simulated)
        {
            var query = new Dictionary<string, string?>
            {
                ["simulated"] = simulated.ToString().ToLower(),
                ["status"] = "completed",
                ["min_temperature"] = min_temperature,
                ["max_temperature"] = max_temperature,
                ["event_date_min"] = start_date,
                ["event_date_max"] = end_date,
                ["run_end_max"] = "2026-12-31"
            };

            string heatwaveServiceUrl = QueryHelpers.AddQueryString("users/system/heatwaves", query);

            _logger.LogInformation("Requesting Heatwave Service URL: {heatwaveServiceUrl}", heatwaveServiceUrl);

            try
            {
                var response = await _httpClient.GetAsync(heatwaveServiceUrl);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var jsonResponse = JsonConvert.DeserializeObject<HeatwaveResponse>(content);
                    return Ok(jsonResponse);
                }

                _logger.LogError("Errore Heatwave Service: {statusCode}", response.StatusCode);
                return StatusCode((int)response.StatusCode, "Errore nella richiesta al servizio heatwave");
            }
            catch (HttpRequestException e)
            {
                _logger.LogError("Errore nella chiamata al servizio heatwave: {message}", e.Message);
                return StatusCode(500, $"Errore nella chiamata al servizio heatwave: {e.Message}");
            }
        }

        [HttpGet("GetLastHeatwave")]
        public async Task<IActionResult> GetLastHeatwave()
        {
            var query = new Dictionary<string, string?>
            {
                ["status_str"] = "submitted",
                ["haztype_id"] = "2"
            };

            string lastHeatwaveServiceUrl = QueryHelpers.AddQueryString("users/system/last_id_run", query);

            _logger.LogInformation("Requesting LastHeatwave Service URL: {lastHeatwaveServiceUrl}", lastHeatwaveServiceUrl);

            try
            {
                var response = await _httpClient.GetAsync(lastHeatwaveServiceUrl);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var jsonResponse = JsonConvert.DeserializeObject<LastHeatwaveResponse>(content);
                    return Ok(jsonResponse);
                }
                else
                {
                    _logger.LogError("Errore LastHeatwave Service: {statusCode}", response.StatusCode);
                    return StatusCode((int)response.StatusCode, "Errore nella richiesta al servizio heatwaves");
                }
            }
            catch (HttpRequestException e)
            {
                _logger.LogError("Errore nella chiamata al servizio heatwaves: {message}", e.Message);
                return StatusCode(500, $"Errore nella chiamata al servizio heatwaves: {e.Message}");
            }
        }

    }

}
