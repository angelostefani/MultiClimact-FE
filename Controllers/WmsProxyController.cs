using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;

namespace MultiClimact.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WmsProxyController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public WmsProxyController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // Rotta per inoltrare la richiesta GetFeatureInfo
        [HttpGet("GetFeatureInfo")]
        public async Task<IActionResult> GetFeatureInfo([FromQuery] string bbox, [FromQuery] string x, [FromQuery] string y)
        {
            // Crea l'URL della richiesta WMS GetFeatureInfo
            string wmsUrl = $"http://192.168.154.105:8080/geoserver/multic/wms?" +
                            $"service=WMS&REQUEST=GetFeatureInfo&QUERY_LAYERS=multic:building&" +
                            $"VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&LAYERS=multic:building&" +
                            $"INFO_FORMAT=application/json&I={x}&J={y}&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox}";

            try
            {
                // Effettua la richiesta al server WMS
                var response = await _httpClient.GetAsync(wmsUrl);

                // Verifica se la richiesta ha avuto successo
                if (response.IsSuccessStatusCode)
                {
                    // Legge il contenuto della risposta
                    var content = await response.Content.ReadAsStringAsync();
                    return Ok(content); // Ritorna il contenuto al client
                }
                else
                {
                    return StatusCode((int)response.StatusCode, "Errore nella richiesta al WMS");
                }
            }
            catch (HttpRequestException e)
            {
                return StatusCode(500, $"Errore nella chiamata al WMS: {e.Message}");
            }
        }
    }
}
