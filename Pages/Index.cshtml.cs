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

        private readonly IHttpContextAccessor _httpContextAccessor;

        public IndexModel(ILogger<IndexModel> logger, IConfiguration configuration, IHttpClientFactory httpClientFactory, IHttpContextAccessor httpContextAccessor)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;

            // Configura l'oggetto HttpClient per accettare connessioni HTTPS
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.BaseAddress = new Uri("http://venere.dhcpnet.casaccia:8080");
            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
        }

        public async Task OnGetAsync()
        {
            // URL del servizio che restituisce il JSON
            string apiUrl = "multic-cipcast-earthquake-ws-8.1/today";

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
            ViewData["wmsurl_mapA1"] = _configuration["wms:wmsurl_mapA1"];
            ViewData["wmslayer_mapA1"] = _configuration["wms:wmslayer_mapA1"];

            ViewData["wmsurl_mapA2"] = _configuration["wms:wmsurl_mapA2"];
            ViewData["wmslayer_mapA2"] = _configuration["wms:wmslayer_mapA2"];

            ViewData["wmsurl_mapA3"] = _configuration["wms:wmsurl_mapA3"];
            ViewData["wmslayer_mapA3"] = _configuration["wms:wmslayer_mapA3"];

            ViewData["wmsurl_mapA4"] = _configuration["wms:wmsurl_mapA4"];
            ViewData["wmslayer_mapA4"] = _configuration["wms:wmslayer_mapA4"];

            ViewData["wmsurl_mapB1"] = _configuration["wms:wmsurl_mapB1"];
            ViewData["wmslayer_mapB1"] = _configuration["wms:wmslayer_mapB1"];

            ViewData["wmsurl_mapB2"] = _configuration["wms:wmsurl_mapB2"];
            ViewData["wmslayer_mapB2"] = _configuration["wms:wmslayer_mapB2"];

            ViewData["wmsurl_mapB3"] = _configuration["wms:wmsurl_mapB3"];
            ViewData["wmslayer_mapB3"] = _configuration["wms:wmslayer_mapB3"];

            ViewData["wmsurl_mapB4"] = _configuration["wms:wmsurl_mapB4"];
            ViewData["wmslayer_mapB4"] = _configuration["wms:wmslayer_mapB4"];

            ViewData["wmsurl_mapB5"] = _configuration["wms:wmsurl_mapB5"];
            ViewData["wmslayer_mapB5"] = _configuration["wms:wmslayer_mapB5"];

            ViewData["wmsurl_mapB6"] = _configuration["wms:wmsurl_mapB6"];
            ViewData["wmslayer_mapB6"] = _configuration["wms:wmslayer_mapB6"];
          

            ViewData["wmsurl_mapC1"] = _configuration["wms:wmsurl_mapC1"];
            ViewData["wmslayer_mapC1"] = _configuration["wms:wmslayer_mapC1"];

            ViewData["wmsurl_mapC2"] = _configuration["wms:wmsurl_mapC2"];
            ViewData["wmslayer_mapC2"] = _configuration["wms:wmslayer_mapC2"];

            ViewData["wmsurl_mapC3"] = _configuration["wms:wmsurl_mapC3"];
            ViewData["wmslayer_mapC3"] = _configuration["wms:wmslayer_mapC3"];

            ViewData["wmsurl_mapC4"] = _configuration["wms:wmsurl_mapC4"];
            ViewData["wmslayer_mapC4"] = _configuration["wms:wmslayer_mapC4"];

            ViewData["wmsurl_mapC5"] = _configuration["wms:wmsurl_mapC5"];
            ViewData["wmslayer_mapC5"] = _configuration["wms:wmslayer_mapC5"];

            ViewData["wmsurl_mapC6"] = _configuration["wms:wmsurl_mapC6"];
            ViewData["wmslayer_mapC6"] = _configuration["wms:wmslayer_mapC6"];

            ViewData["wmsurl_mapC7"] = _configuration["wms:wmsurl_mapC7"];
            ViewData["wmslayer_mapC7"] = _configuration["wms:wmslayer_mapC7"];

            ViewData["wmsurl_mapC8"] = _configuration["wms:wmsurl_mapC8"];
            ViewData["wmslayer_mapC8"] = _configuration["wms:wmslayer_mapC8"];

            ViewData["wmsurl_mapC9"] = _configuration["wms:wmsurl_mapC9"];
            ViewData["wmslayer_mapC9"] = _configuration["wms:wmslayer_mapC9"];

            ViewData["wmsurl_mapC10"] = _configuration["wms:wmsurl_mapC10"];
            ViewData["wmslayer_mapC10"] = _configuration["wms:wmslayer_mapC10"];

            ViewData["wmsurl_mapC11"] = _configuration["wms:wmsurl_mapC11"];
            ViewData["wmslayer_mapC11"] = _configuration["wms:wmslayer_mapC11"];

            ViewData["wmsurl_mapC12"] = _configuration["wms:wmsurl_mapC12"];
            ViewData["wmslayer_mapC12"] = _configuration["wms:wmslayer_mapC12"];

            ViewData["wmsurl_mapC13"] = _configuration["wms:wmsurl_mapC13"];
            ViewData["wmslayer_mapC13"] = _configuration["wms:wmslayer_mapC13"];

            ViewData["wmsurl_mapD1"] = _configuration["wms:wmsurl_mapD1"];
            ViewData["wmslayer_mapD1"] = _configuration["wms:wmslayer_mapD1"];

            ViewData["wmsurl_mapD2"] = _configuration["wms:wmsurl_mapD2"];
            ViewData["wmslayer_mapD2"] = _configuration["wms:wmslayer_mapD2"];

            ViewData["wmsurl_mapD3"] = _configuration["wms:wmsurl_mapD3"];
            ViewData["wmslayer_mapD3"] = _configuration["wms:wmslayer_mapD3"];

            ViewData["wmsurl_mapD4"] = _configuration["wms:wmsurl_mapD4"];
            ViewData["wmslayer_mapD4"] = _configuration["wms:wmslayer_mapD4"];

            ViewData["wmsurl_mapD5"] = _configuration["wms:wmsurl_mapD5"];
            ViewData["wmslayer_mapD5"] = _configuration["wms:wmslayer_mapD5"];
            
           
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

                String s3 = Newtonsoft.Json.JsonConvert.SerializeObject(requestData);

                var content = new StringContent(s3, null, "application/json");

                request.Content = content;
                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();
                Console.WriteLine(await response.Content.ReadAsStringAsync());

                if (response.IsSuccessStatusCode)
                {
                    // Salva un valore nella sessione
                    HttpContext.Session.SetString("activeMenu", "Earthquake");
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