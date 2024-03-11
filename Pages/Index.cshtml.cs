using System;
using System.Net;
using System.Net.Http;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
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
        
        public IndexModel(ILogger<IndexModel> logger, IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _configuration = configuration;

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
    }
}
