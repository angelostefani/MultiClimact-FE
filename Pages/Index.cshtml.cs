using System;
using System.Net;
using System.Net.Http;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace MultiClimact.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly IHttpClientFactory _httpClientFactory;
            
        public IndexModel(ILogger<IndexModel> logger, IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;

            // Configura l'oggetto HttpClient per accettare connessioni HTTPS
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.BaseAddress = new Uri("http://marte.dhcpnet.casaccia:8080");
            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
        }

        public async Task OnGetAsync()
        {
            // URL del servizio che restituisce il JSON
            string apiUrl = "/multic-cipcast-earthquake-ws/today";

            try
            {
                // Ignora eventuali errori di certificato (solo per scopi di test)
                ServicePointManager.ServerCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) => true;

                // Effettua la richiesta HTTP
                HttpResponseMessage response = await _httpClient.GetAsync(apiUrl);

                // Controlla se la richiesta ha avuto successo (codice 200)
                if (response.IsSuccessStatusCode)
                {
                    // Leggi i dati JSON come stringa
                    string jsonContent = await response.Content.ReadAsStringAsync();
                    // Pass jsonContent to the view model
                    ViewData["jsonContent"] = jsonContent;
                }
                else
                {
                    // Se la richiesta non ha avuto successo, logga l'errore
                    _logger.LogError($"Error fetching earthquake data. Status code: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                // Gestisci eventuali eccezioni durante la richiesta
                _logger.LogError($"Error fetching earthquake data: {ex.Message}");
            }

            // Altri dati da passare alla vista
            ViewData["wmsurl1"] = _configuration["wms:wmsurl1"];
            ViewData["wmslayer1"] = _configuration["wms:wmslayer1"];

            ViewData["wmsurl2"] = _configuration["wms:wmsurl2"];
            ViewData["wmslayer2"] = _configuration["wms:wmslayer2"];

            ViewData["wmsurl3"] = _configuration["wms:wmsurl3"];
            ViewData["wmslayer3"] = _configuration["wms:wmslayer3"];

            ViewData["wmsurl4"] = _configuration["wms:wmsurl4"];
            ViewData["wmslayer4"] = _configuration["wms:wmslayer4"];

            ViewData["wmsurl5"] = _configuration["wms:wmsurl5"];
            ViewData["wmslayer5"] = _configuration["wms:wmslayer5"];

            // ... (Altri dati)
        }

        public async Task<IActionResult> OnPostAsync()
        {

            try
            {
                var apiUrl = _configuration["servizioWeb"]; // Get the API URL from configuration
                var earthquake = new
                {
                    lon = Request.Form["lon"],
                    lat = Request.Form["lat"],
                    description = Request.Form["description"],
                    damageLaw = Request.Form["damageLaw"],
                    pgaLaw = Request.Form["pgaLaw"],
                    depth = Request.Form["depth"],
                    magnitude = Request.Form["magnitude"],
                    fault = Request.Form["fault"],
                    options = Request.Form["options"],
                    radius = Request.Form["radius"]
                };

                var userPlatform = new
                {
                    idUser = "az123" // Hardcoded user ID for now
                };

                var requestData = new
                {
                    earthquake,
                    userPlatform
                };

                var httpClient = _httpClientFactory.CreateClient();
                var content = new StringContent(Newtonsoft.Json.JsonConvert.SerializeObject(requestData), Encoding.UTF8, "application/json");
                
                var response = await httpClient.PostAsync(apiUrl, content);

                if (response.IsSuccessStatusCode)
                {
                    // Handle success
                    return RedirectToPage("/SuccessPage"); // Redirect to a success page
                }
                else
                {
                    // Handle failure
                    _logger.LogError($"Error submitting earthquake data. Status code: {response.StatusCode}");
                    return Page(); // Stay on the same page
                }
            }
            catch (Exception ex)
            {
                // Handle exceptions
                _logger.LogError($"Error submitting earthquake data: {ex.Message}");
                return Page(); // Stay on the same page
            }
        }

    }
}