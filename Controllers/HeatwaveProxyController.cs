using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
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

        //[HttpGet("GetHeatwavesMock")]
        //public IActionResult GetHeatwavesMock(
        //    [FromQuery] string user_id,
        //    [FromQuery] string start_date,
        //    [FromQuery] string end_date,
        //    [FromQuery] string min_temperature,
        //    [FromQuery] bool simulated)
        //{
        //    // Risposta Mock
        //    var mockResponse = new HeatwaveResponse
        //    {
        //        Success = true,
        //        Data = new List<HeatwaveData>
        //{
        //    new HeatwaveData
        //    {
        //        IdRun = "599",
        //        Description = "1 Visso 26 Ottobre 2016",
        //        EventDate = DateTime.Parse("2016-10-26T17:01:16.630000"),
        //        Status = "submitted",
        //        ImpactConf = "ancona_impact",
        //        DamageConf = "ancona_damage",
        //        Temperature = 5.9
        //    },
        //    new HeatwaveData
        //    {
        //        IdRun = "599",
        //        Description = "2 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
        //        EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
        //        Status = "completed",
        //        ImpactConf = "camerino_impact",
        //        DamageConf = "camerino_damage",
        //        Temperature = 6.0
        //    },
        //    new HeatwaveData
        //    {
        //        IdRun = "599",
        //        Description = "3 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
        //        EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
        //        Status = "completed",
        //        ImpactConf = "camerino_impact",
        //        DamageConf = "camerino_damage",
        //        Temperature = 6.0
        //    },
        //    new HeatwaveData
        //    {
        //        IdRun = "599",
        //        Description = "4 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
        //        EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
        //        Status = "completed",
        //        ImpactConf = "camerino_impact",
        //        DamageConf = "camerino_damage",
        //        Temperature = 6.0
        //    },
        //    new HeatwaveData
        //    {
        //        IdRun = "599",
        //        Description = "5 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
        //        EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
        //        Status = "completed",
        //        ImpactConf = "camerino_impact",
        //        DamageConf = "camerino_damage",
        //        Temperature = 6.0
        //    },
        //    new HeatwaveData
        //    {
        //        IdRun = "599",
        //        Description = "6 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
        //        EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
        //        Status = "completed",
        //        ImpactConf = "camerino_impact",
        //        DamageConf = "camerino_damage",
        //        Temperature = 6.0
        //    },
        //    new HeatwaveData
        //    {
        //        IdRun = "599",
        //        Description = "7 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
        //        EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
        //        Status = "completed",
        //        ImpactConf = "camerino_impact",
        //        DamageConf = "camerino_damage",
        //        Temperature = 6.0
        //    },
        //    new HeatwaveData
        //    {
        //        IdRun = "599",
        //        Description = "8 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
        //        EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
        //        Status = "completed",
        //        ImpactConf = "camerino_impact",
        //        DamageConf = "camerino_damage",
        //        Temperature = 6.0
        //    },
        //    new HeatwaveData
        //    {
        //        IdRun = "599",
        //        Description = "9 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
        //        EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
        //        Status = "completed",
        //        ImpactConf = "camerino_impact",
        //        DamageConf = "camerino_damage",
        //        Temperature = 6.0
        //    },
        //    new HeatwaveData
        //    {
        //        IdRun = "599",
        //        Description = "10 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
        //        EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
        //        Status = "completed",
        //        ImpactConf = "camerino_impact",
        //        DamageConf = "camerino_damage",
        //        Temperature = 6.0
        //    },
        //    new HeatwaveData
        //    {
        //        IdRun = "599",
        //        Description = "11 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
        //        EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
        //        Status = "completed",
        //        ImpactConf = "camerino_impact",
        //        DamageConf = "camerino_damage",
        //        Temperature = 6.0
        //    },
        //    new HeatwaveData
        //    {
        //        IdRun = "599",
        //        Description = "12 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
        //        EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
        //        Status = "completed",
        //        ImpactConf = "camerino_impact",
        //        DamageConf = "camerino_damage",
        //        Temperature = 6.0
        //    },
        //    new HeatwaveData
        //    {
        //        IdRun = "599",
        //        Description = "13 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
        //        EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
        //        Status = "completed",
        //        ImpactConf = "camerino_impact",
        //        DamageConf = "camerino_damage",
        //        Temperature = 6.0
        //    },
        //    new HeatwaveData
        //    {
        //        IdRun = "599",
        //        Description = "14 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
        //        EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
        //        Status = "completed",
        //        ImpactConf = "camerino_impact",
        //        DamageConf = "camerino_damage",
        //        Temperature = 6.0
        //    }

        //}
        //    };

        //    return Ok(mockResponse);
        //}

        //[HttpGet("GetHeatwaves")]
        //public async Task<IActionResult> GetHeatwaves(
        //    [FromQuery] string user_id,
        //    [FromQuery] string start_date,
        //    [FromQuery] string end_date,
        //    [FromQuery] string min_temperature,
        //    [FromQuery] string max_temperature,
        //    [FromQuery] bool simulated)
        //{
        //    string heatwaveServiceUrl = $"http://192.168.154.23:8000/users/system/heatwaves?simulated=false&status=completed&min_temperature={min_temperature}&event_date_min={start_date}&event_date_max={end_date}&run_end_max=2025-01-01";

        //    _logger.LogInformation("Requesting Heatwave Service URL: {heatwaveServiceUrl}", heatwaveServiceUrl);

        //    try
        //    {
        //        var response = await _httpClient.GetAsync(heatwaveServiceUrl);
        //        if (response.IsSuccessStatusCode)
        //        {
        //            var content = await response.Content.ReadAsStringAsync();
        //            var jsonResponse = JsonConvert.DeserializeObject<HeatwaveResponse>(content);
        //            return Ok(jsonResponse);
        //        }
        //        else
        //        {
        //            _logger.LogError("Errore Heatwave Service: {statusCode}", response.StatusCode);
        //            return StatusCode((int)response.StatusCode, "Errore nella richiesta al servizio heatwave");
        //        }
        //    }
        //    catch (HttpRequestException e)
        //    {
        //        _logger.LogError("Errore nella chiamata al servizio heatwave: {message}", e.Message);
        //        return StatusCode(500, $"Errore nella chiamata al servizio heatwave: {e.Message}");
        //    }
        //}

        [HttpGet("GetLastHeatwave")]
        public async Task<IActionResult> GetLastHeatwave()
        {
            var query = new Dictionary<string, string?>
            {
                ["staus_str"] = "submitted",
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