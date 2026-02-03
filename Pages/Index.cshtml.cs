/*
This class is part of an ASP.NET Core application. 
It serves as the backend logic for the Index page in a Razor Pages application, 
handling configuration settings and ViewData population for dynamic rendering in the Razor view.
*/

using System;
using System.Net.Http;
using System.Text.Json;  // Namespace for JSON deserialization
using System.Threading.Tasks;
using System.Collections.Generic;
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
            await GetLastHeatwaveIdRun();
            await GetLastExtremePrecipitationIdRun();

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
        /// Fetches the latest extreme precipitation ID run from an external REST API.
        /// The retrieved ID is stored in ViewData["idRunLastExtremePrecipitation"] for use in the Razor view.
        /// </summary>
        /// <returns>An asynchronous Task.</returns>
        private async Task GetLastExtremePrecipitationIdRun()
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var serviceUrl = $"{baseUrl}/api/ExtremeprecipitationProxy/GetLastExtremeprecipitation";

            try
            {
                var client = _httpClientFactory.CreateClient("Default");
                var response = await client.GetAsync(serviceUrl);

                if (response.IsSuccessStatusCode)
                {
                    var responseBody = await response.Content.ReadAsStringAsync();
                    var data = JsonSerializer.Deserialize<LastExtremeprecipitationResponse>(responseBody);
                    ViewData["idRunLastExtremePrecipitation"] = data?.id_run ?? "idRun not available in the response";
                }
                else
                {
                    ViewData["idRunLastExtremePrecipitation"] = $"Error calling the service: {response.StatusCode}";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while calling the ExtremeprecipitationProxy service.");
                ViewData["idRunLastExtremePrecipitation"] = $"Exception: {ex.Message}";
            }
        }

        /// <summary>
        /// Maps configuration settings from appsettings.json to ViewData for use in the Razor view.
        /// These settings define WMS (Web Map Service) URLs and layers to dynamically populate the view.
        /// </summary>
        private void ConfigurationToViewDataMapping()
        {
            var wmsBaseUrl = _configuration["wms:wmsurl_baseurl"];
            ViewData["wmsurl_baseurl"] = wmsBaseUrl;

            var wmsLayerKeys = new[]
            {
                "wmslayer_earth_real_view",
                "wmslayer_poibui_damage_view",
                "wmslayer_earth_building_vuln_view",
                "wmslayer_fazzini_bui_damage_view",
                "wmslayer_earth_substation_view",
                "wmslayer_earth_water_tower_view",
                "wmslayer_earth_water_well_view",
                "wmslayer_earth_waste_water_view",
                "wmslayer_failure_scenario_view",
                "wmslayer_earth_waste_water_damage_view",
                "wmslayer_shakemap",
                "wmslayer_heatwave_tmp_2maboveground_view",
                "wmslayer_flood_tprate_surface",
                "wmslayer_riverflood_housenew_view",
                "wmslayer_poi_prec",
                "wmslayer_building",
                "wmslayer_riverflood_housenew_view_alt",
                "wmslayer_extprec_6_classes_view",
                "wmslayer_extprec_3_classes_view",
                "wmslayer_extprec_poi_vuln_view",
                "wmslayer_extprec_poi_risk_view",
                "wmslayer_extprec_building_vuln_view",
                "wmslayer_extprec_building_risk_view",
                "wmslayer_building_sim",
                "wmslayer_poi_prec_sim_view",
                "wmslayer_heatwave_real_view",
                "wmslayer_heatwave_roadway_view",
                "wmslayer_heatwave_roadway_damage_view",
                "wmslayer_dpc_bulletins_hydraulic_view",
                "wmslayer_dpc_bulletins_hydrogeological_view",
                "wmslayer_dpc_bulletins_thunderstorms_view",
                "wmslayer_earth_building_damage_view",
                "wmslayer_earth_shakemap_view",
                "wmslayer_earth_poibui_damage_view",
                "wmslayer_earth_poibui_vuln_view",
                "wmslayer_earth_poibui_view",
                "wmslayer_earth_water_tower_vuln_view",
                "wmslayer_earth_water_tower_damage_view",
                "wmslayer_earth_substation_vuln_view",
                "wmslayer_earth_substation_damage_view",
                "wmslayer_earth_waste_water_vuln_view",
                "wmslayer_earth_waste_water_damage_view",
                "wmslayer_earth_water_well_vuln_view",
                "wmslayer_earth_water_well_damage_view",
            };

            var wmsLayerKeyList = new List<string>();

            foreach (var layerKey in wmsLayerKeys)
            {
                wmsLayerKeyList.Add(layerKey);
                ViewData[layerKey] = _configuration[$"wms:{layerKey}"];
            }

            ViewData["wmsLayerKeys"] = wmsLayerKeyList;

            // Additional commented-out configurations for Points of Interest (POI)
            /*
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
