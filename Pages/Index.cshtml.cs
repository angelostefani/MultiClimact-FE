/*
This class is part of an ASP.NET Core application. 
It serves as the backend logic for the Index page in a Razor Pages application, 
handling configuration settings and ViewData population for dynamic rendering in the Razor view.
*/

using System;
using System.Net.Http;
using System.Text.Json;  // Namespace for JSON deserialization
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MultiClimact.Models;

namespace MultiClimact.Pages
{
    /// <summary>
    /// The IndexModel class handles the backend logic for the Index Razor page.
    /// It retrieves and processes earthquake data from an external API and 
    /// maps configuration values to ViewData for dynamic content rendering in the Razor view.
    /// </summary>
    /// <remarks>
    /// Initializes an instance of the <see cref="IndexModel"/> class.
    /// </remarks>
    /// <param name="logger">Logger instance for logging errors and information.</param>
    /// <param name="configuration">Application configuration for retrieving settings.</param>
    public class IndexModel(ILogger<IndexModel> logger, IConfiguration configuration, IHttpClientFactory httpClientFactory) : PageModel
    {
        private readonly ILogger<IndexModel> _logger = logger;
        private readonly IConfiguration _configuration = configuration;
        private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;

        /// <summary>
        /// Handles HTTP GET requests for the Index page asynchronously.
        /// Fetches the latest earthquake run ID from an external API and 
        /// populates ViewData with relevant WMS (Web Map Service) configuration settings.
        /// </summary>
        /// <returns>A Task representing the asynchronous operation.</returns>
        public async Task OnGetAsync()
        {
            await GetLastEarthquakeIdRun();

            ConfigurationToViewDataMapping();
        }

        /// <summary>
        /// Fetches the latest earthquake ID run from an external REST API.
        /// The retrieved ID is stored in ViewData["idRunLastEarthquake"] for use in the Razor view.
        /// </summary>
        /// <returns>An asynchronous Task.</returns>
        private async Task GetLastEarthquakeIdRun()
        {
            // Define the API endpoint URL
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var serviceUrl = $"{baseUrl}/api/EarthquakeProxy/GetLastEarthquake";

            try
            {
                var client = _httpClientFactory.CreateClient("Default");
                    var response = await client.GetAsync(serviceUrl);

                    if (response.IsSuccessStatusCode)
                    {
                        // Read the response content as a JSON string
                        var responseBody = await response.Content.ReadAsStringAsync();

                        // Deserialize the JSON response into a .NET object
                        var data = JsonSerializer.Deserialize<LastEarthquakeResponse>(responseBody);

                        // Store the retrieved earthquake ID in ViewData
                        ViewData["idRunLastEarthquake"] = data?.id_run ?? "idRun not available in the response";
                    }
                    else
                    {
                        // Handle unsuccessful API response
                        ViewData["idRunLastEarthquake"] = $"Error calling the service: {response.StatusCode}";
                    }
            }
            catch (Exception ex)
            {
                // Log the exception and store an error message in ViewData
                _logger.LogError(ex, "An error occurred while calling the EarthquakeProxy service.");
                ViewData["idRunLastEarthquake"] = $"Exception: {ex.Message}";
            }
        }

        /// <summary>
        /// Fetches the latest heatwave ID run from an external REST API.
        /// The retrieved ID is stored in ViewData["idRunLastHeatwave"] for use in the Razor view.
        /// </summary>
        /// <returns>An asynchronous Task.</returns>
        private async Task GetLastHeatwaveIdRun()
        {
            // Define the API endpoint URL
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var serviceUrl = $"{baseUrl}/api/HeatwaveProxy/GetLastHeatwave";

            try
            {
                var client = _httpClientFactory.CreateClient("Default");
                    var response = await client.GetAsync(serviceUrl);

                    if (response.IsSuccessStatusCode)
                    {
                        // Read the response content as a JSON string
                        var responseBody = await response.Content.ReadAsStringAsync();

                        // Deserialize the JSON response into a .NET object
                        var data = JsonSerializer.Deserialize<LastHeatwaveResponse>(responseBody);

                        // Store the retrieved earthquake ID in ViewData
                        ViewData["idRunLastHeatwave"] = data?.id_run ?? "idRun not available in the response";
                    }
                    else
                    {
                        // Handle unsuccessful API response
                        ViewData["idRunLastHeatwave"] = $"Error calling the service: {response.StatusCode}";
                    }
            }
            catch (Exception ex)
            {
                // Log the exception and store an error message in ViewData
                _logger.LogError(ex, "An error occurred while calling the HeatwaveProxy service.");
                ViewData["idRunLastHeatwave"] = $"Exception: {ex.Message}";
            }
        }

        /// <summary>
        /// Maps configuration settings from appsettings.json to ViewData for use in the Razor view.
        /// These settings define WMS (Web Map Service) URLs and layers to dynamically populate the view.
        /// </summary>
        private void ConfigurationToViewDataMapping()
        {
            // Mapping configuration settings for WMS layers and legends
            var wmsLayers = new[]
            {
                new { Key = "wmsurl_lay00", Description = "Real-time earthquakes with risk analysis" },
                new { Key = "wmsurl_lay01", Description = "POI Buildings in Marche Region" },
                new { Key = "wmsurl_lay02", Description = "Camerino buildings" },
                new { Key = "wmsurl_lay03", Description = "Fazzini buildings" },
                new { Key = "wmsurl_lay04", Description = "Electric substations" },
                new { Key = "wmsurl_lay05", Description = "Water towers" },
                new { Key = "wmsurl_lay06", Description = "Water wells" },
                new { Key = "wmsurl_lay07", Description = "Wastewater plants" },
                new { Key = "wmsurl_lay08", Description = "Risk paths" },
                new { Key = "wmsurl_lay09", Description = "Failure scenarios" },
                new { Key = "wmsurl_lay10", Description = "Shakemap" },
                new { Key = "wmsurl_lay11", Description = "Temperature above ground" },
                new { Key = "wmsurl_lay12", Description = "Flood precipitation rate" },
                new { Key = "wmsurl_lay13", Description = "River Floods risk analisys" }
            };

            // Loop through WMS layers and store them in ViewData dynamically
            foreach (var layer in wmsLayers)
            {
                ViewData[layer.Key] = _configuration[$"wms:{layer.Key}"];
                ViewData[layer.Key.Replace("url", "layer")] = _configuration[$"wms:{layer.Key.Replace("url", "layer")}"];
            }

            // Additional commented-out configurations for Points of Interest (POI)
            /*
            ViewData["wmsurl_map_poi"] = _configuration["wms:wmsurl_map_poi"];

            ViewData["wmslayer_map_poibui"] = _configuration["wms:wmslayer_map_poibui"];
            ViewData["wmslegend_map_poibui"] = _configuration["wms:wmslegend_map_poibui"];

            ViewData["wmslayer_map_poiinf"] = _configuration["wms:wmslayer_map_poiinf"];
            ViewData["wmslegend_map_poiinf"] = _configuration["wms:wmslegend_map_poiinf"];

            ViewData["wmslayer_map_poigen"] = _configuration["wms:wmslayer_map_poigen"];
            ViewData["wmslegend_map_poigen"] = _configuration["wms:wmslegend_map_poigen"];
            */
        }
    }
}
