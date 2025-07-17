using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Net.Http;
using System.Threading.Tasks;
using MultiClimact.Models;


namespace MultiClimact.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EarthquakeProxyController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<EarthquakeProxyController> _logger;

        public EarthquakeProxyController(HttpClient httpClient, ILogger<EarthquakeProxyController> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }


        [HttpGet("GetEarthquakesMock")]
        public IActionResult GetEarthquakesMock(
            [FromQuery] string user_id,
            [FromQuery] string start_date,
            [FromQuery] string end_date,
            [FromQuery] string min_magnitude,
            [FromQuery] bool simulated)
        {
            // Risposta Mock
            var mockResponse = new EarthquakeResponse
            {
                Success = true,
                Data = new List<EarthquakeData>
        {
            new EarthquakeData
            {
                IdRun = "599",
                Description = "1 Visso 26 Ottobre 2016",
                EventDate = DateTime.Parse("2016-10-26T17:01:16.630000"),
                Status = "submitted",
                ImpactConf = "ancona_impact",
                DamageConf = "ancona_damage",
                Magnitude = 5.9
            },
            new EarthquakeData
            {
                IdRun = "599",
                Description = "2 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
                EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
                Status = "completed",
                ImpactConf = "camerino_impact",
                DamageConf = "camerino_damage",
                Magnitude = 6.0
            },
            new EarthquakeData
            {
                IdRun = "599",
                Description = "3 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
                EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
                Status = "completed",
                ImpactConf = "camerino_impact",
                DamageConf = "camerino_damage",
                Magnitude = 6.0
            },
            new EarthquakeData
            {
                IdRun = "599",
                Description = "4 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
                EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
                Status = "completed",
                ImpactConf = "camerino_impact",
                DamageConf = "camerino_damage",
                Magnitude = 6.0
            },
            new EarthquakeData
            {
                IdRun = "599",
                Description = "5 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
                EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
                Status = "completed",
                ImpactConf = "camerino_impact",
                DamageConf = "camerino_damage",
                Magnitude = 6.0
            },
            new EarthquakeData
            {   
                IdRun = "599",
                Description = "6 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
                EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
                Status = "completed",
                ImpactConf = "camerino_impact",
                DamageConf = "camerino_damage",
                Magnitude = 6.0
            },
            new EarthquakeData
            {   
                IdRun = "599",
                Description = "7 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
                EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
                Status = "completed",
                ImpactConf = "camerino_impact",
                DamageConf = "camerino_damage",
                Magnitude = 6.0
            },
            new EarthquakeData
            {   
                IdRun = "599",
                Description = "8 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
                EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
                Status = "completed",
                ImpactConf = "camerino_impact",
                DamageConf = "camerino_damage",
                Magnitude = 6.0
            },
            new EarthquakeData
            {   
                IdRun = "599",
                Description = "9 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
                EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
                Status = "completed",
                ImpactConf = "camerino_impact",
                DamageConf = "camerino_damage",
                Magnitude = 6.0
            },
            new EarthquakeData
            {   
                IdRun = "599",
                Description = "10 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
                EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
                Status = "completed",
                ImpactConf = "camerino_impact",
                DamageConf = "camerino_damage",
                Magnitude = 6.0
            },
            new EarthquakeData
            {   
                IdRun = "599",
                Description = "11 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
                EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
                Status = "completed",
                ImpactConf = "camerino_impact",
                DamageConf = "camerino_damage",
                Magnitude = 6.0
            },
            new EarthquakeData
            {   
                IdRun = "599",
                Description = "12 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
                EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
                Status = "completed",
                ImpactConf = "camerino_impact",
                DamageConf = "camerino_damage",
                Magnitude = 6.0
            },
            new EarthquakeData
            {   
                IdRun = "599",
                Description = "13 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
                EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
                Status = "completed",
                ImpactConf = "camerino_impact",
                DamageConf = "camerino_damage",
                Magnitude = 6.0
            },
            new EarthquakeData
            {   
                IdRun = "599",
                Description = "14 Accumoli 24 Agosto 2016 - Faccioli-Cauzzi",
                EventDate = DateTime.Parse("2016-08-24T17:01:16.630000"),
                Status = "completed",
                ImpactConf = "camerino_impact",
                DamageConf = "camerino_damage",
                Magnitude = 6.0
            }

        }
            };

            return Ok(mockResponse);
        }


        [HttpGet("GetEarthquakes")]
        public async Task<IActionResult> GetEarthquakes(
            [FromQuery] string user_id,
            [FromQuery] string start_date,
            [FromQuery] string end_date,
            [FromQuery] string min_magnitude,
            [FromQuery] string max_magnitude,
            [FromQuery] bool simulated)
        {
            string earthquakeServiceUrl = $"http://192.168.154.23:8000/users/system/earthquakes?simulated=false&status=completed&min_magnitude={min_magnitude}&event_date_min={start_date}&event_date_max={end_date}&run_end_max=2025-01-01";

            _logger.LogInformation("Requesting Earthquake Service URL: {earthquakeServiceUrl}", earthquakeServiceUrl);

            try
            {
                var response = await _httpClient.GetAsync(earthquakeServiceUrl);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var jsonResponse = JsonConvert.DeserializeObject<EarthquakeResponse>(content);
                    return Ok(jsonResponse);
                }
                else
                {
                    _logger.LogError("Errore Earthquake Service: {statusCode}", response.StatusCode);
                    return StatusCode((int)response.StatusCode, "Errore nella richiesta al servizio terremoti");
                }
            }
            catch (HttpRequestException e)
            {
                _logger.LogError("Errore nella chiamata al servizio terremoti: {message}", e.Message);
                return StatusCode(500, $"Errore nella chiamata al servizio terremoti: {e.Message}");
            }
        }

        [HttpGet("GetLastEarthquake")]
        public async Task<IActionResult> GetLastEarthquake()
        {
            string lastEarthquakeServiceUrl = $"http://192.168.154.23:8000/users/system/last_id_run?staus_str=submitted&haztype_id=1";

            _logger.LogInformation("Requesting LastEarthquake Service URL: {lastEarthquakeServiceUrl}", lastEarthquakeServiceUrl);

            try
            {
                var response = await _httpClient.GetAsync(lastEarthquakeServiceUrl);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var jsonResponse = JsonConvert.DeserializeObject<LastEarthquakeResponse>(content);
                    return Ok(jsonResponse);
                }
                else
                {
                    _logger.LogError("Errore LastEarthquake Service: {statusCode}", response.StatusCode);
                    return StatusCode((int)response.StatusCode, "Errore nella richiesta al servizio terremoti");
                }
            }
            catch (HttpRequestException e)
            {
                _logger.LogError("Errore nella chiamata al servizio terremoti: {message}", e.Message);
                return StatusCode(500, $"Errore nella chiamata al servizio terremoti: {e.Message}");
            }
        }

    }

}