/*
This code sets up services related to localization, database, authentication, and HTTP requests in an ASP.NET Core application.
It configures localization for different cultures, connects to a PostgreSQL database, sets up identity management with Entity Framework, adds HTTP client services, and configures the HTTP request pipeline for routing, authentication, and authorization.
*/

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
        double Lon;
        double Lat;
        string? Description;
        int DamageLaw;
        int PgaLaw;
        double Depth;
        double Magnitude;
        int Fault;
        string? Options;
        int Radius;

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

                Lon = double.Parse(Request.Form["lon"], System.Globalization.CultureInfo.InvariantCulture);
                Lat = double.Parse(Request.Form["lat"], System.Globalization.CultureInfo.InvariantCulture);
                Description = Request.Form["description"];
                DamageLaw = int.Parse(Request.Form["damageLaw"]);
                PgaLaw = int.Parse(Request.Form["pgaLaw"]);
                Depth = double.Parse(Request.Form["depth"], System.Globalization.CultureInfo.InvariantCulture);
                Magnitude = double.Parse(Request.Form["magnitude"], System.Globalization.CultureInfo.InvariantCulture);
                Fault = int.Parse(Request.Form["fault"]);
                Options = Request.Form["options"];
                Radius = int.Parse(Request.Form["radius"]);

                var earthquake = new
                {
                     
                    /*lon = 42.9087,
                    lat = 13.1288,
                    description = "visso test",
                    damageLaw = 4,
                    pgaLaw = 5,
                    depth = 6.0,
                    magnitude = 5.0,
                    fault = 0,
                    options = "100000111",
                    radius = 30*/

                    lon = Lon,
                    lat = Lat,
                    description = Description,
                    damageLaw = DamageLaw,
                    pgaLaw = PgaLaw,
                    depth = Depth,
                    magnitude = Magnitude,
                    fault = Fault,
                    options = Options,
                    radius = Radius

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

                // Esempio di stampa dei dati sulla console
                System.Console.WriteLine("Lon: " + Lon);
                System.Console.WriteLine("Lat: " + Lat);
                System.Console.WriteLine("Description: " + Description);
                System.Console.WriteLine("DamageLaw: " + DamageLaw);
                System.Console.WriteLine("PgaLaw: " + PgaLaw);
                System.Console.WriteLine("Depth: " + Depth);
                System.Console.WriteLine("Magnitude: " + Magnitude);
                System.Console.WriteLine("Fault: " + Fault);
                System.Console.WriteLine("Options: " + Options);
                System.Console.WriteLine("Radius: " + Radius);

                var client = new HttpClient();
                var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);

                // String s2 = "{\"earthquake\":{\"lon\":42.9087,\"lat\": 13.1288,\"description\":\"visso test\",\"damageLaw\":4,\"pgaLaw\":5,\"depth\":6.0,\"magnitude\":5.0,\"fault\":0,\"options\":\"100000111\",\"radius\":30},\"userPlatform\":{\"idUser\":\"az123\"}}";
                String s3 = Newtonsoft.Json.JsonConvert.SerializeObject(requestData);

                var content = new StringContent(s3, null, "application/json");

                request.Content = content;
                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();
                Console.WriteLine(await response.Content.ReadAsStringAsync());

                if (response.IsSuccessStatusCode)
                {
                    // Handle success
                    return RedirectToPage("/index"); // Redirect to a success page
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