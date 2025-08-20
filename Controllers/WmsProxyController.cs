using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Xml;

namespace MultiClimact.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WmsProxyController(HttpClient httpClient, ILogger<WmsProxyController> logger, IConfiguration configuration) : ControllerBase
    {
        private readonly HttpClient _httpClient = httpClient;
        private readonly ILogger<WmsProxyController> _logger = logger;
        private readonly string _wmsBaseUrl = configuration["wms:wmsurl_lay00"];

        public string WmsBaseUrl => _wmsBaseUrl;

        public string WmsBaseUrl1 => _wmsBaseUrl;

        [HttpGet("GetFeatureInfo")]
        public async Task<IActionResult> GetFeatureInfo(
            [FromQuery] string bbox,
            [FromQuery] string x,
            [FromQuery] string y,
            [FromQuery] string width,
            [FromQuery] string height,
            [FromQuery] string layer)
        {
            if (string.IsNullOrEmpty(bbox) || string.IsNullOrEmpty(x) || string.IsNullOrEmpty(y) ||
                string.IsNullOrEmpty(width) || string.IsNullOrEmpty(height) || string.IsNullOrEmpty(layer))
            {
                _logger.LogWarning("Parametri mancanti: bbox, x, y, width, height e layer sono richiesti.");
                return BadRequest("Parametri mancanti: bbox, x, y, width, height e layer sono richiesti.");
            }

            string wmsUrl = $"{_wmsBaseUrl}?" +
                            $"service=WMS&REQUEST=GetFeatureInfo&QUERY_LAYERS={layer}&" +
                            $"VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&LAYERS={layer}&" +
                            $"INFO_FORMAT=text/xml&I={x}&J={y}&WIDTH={width}&HEIGHT={height}&CRS=EPSG:3857&BBOX={bbox}";

            _logger.LogInformation("Requesting WMS URL: {wmsUrl}", wmsUrl);

            try
            {
                var response = await _httpClient.GetAsync(wmsUrl);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var xmlDoc = new XmlDocument();
                    xmlDoc.LoadXml(content);

                    var featureNode = xmlDoc.SelectSingleNode($"//{layer}", CreateXmlNamespaceManager(xmlDoc));
                    if (featureNode != null)
                    {
                        var jsonResult = new JObject
                        {
                            ["lat"] = featureNode[$"multic:lat"]?.InnerText,
                            ["lon"] = featureNode[$"multic:lon"]?.InnerText,
                            ["residents"] = featureNode[$"multic:residents"]?.InnerText,
                            ["seismic_v"] = featureNode[$"multic:seismic_v"]?.InnerText,
                            ["vs30"] = featureNode[$"multic:vs30"]?.InnerText,
                            ["region"] = featureNode[$"multic:region"]?.InnerText,
                            ["town"] = featureNode[$"multic:town"]?.InnerText
                        };
                        // Return as JSON object, not a serialized string
                        return Ok(jsonResult);
                    }
                    else
                    {
                        return NotFound("Nessuna informazione trovata per il punto selezionato.");
                    }
                }
                else
                {
                    _logger.LogError("Errore WMS: {statusCode}", response.StatusCode);
                    return StatusCode((int)response.StatusCode, "Errore nella richiesta al WMS");
                }
            }
            catch (HttpRequestException e)
            {
                _logger.LogError("Errore nella chiamata al WMS: {message}", e.Message);
                return StatusCode(500, $"Errore nella chiamata al WMS: {e.Message}");
            }
        }

        private static XmlNamespaceManager CreateXmlNamespaceManager(XmlDocument doc)
        {
            var nsmgr = new XmlNamespaceManager(doc.NameTable);
            nsmgr.AddNamespace("wfs", "http://www.opengis.net/wfs");
            nsmgr.AddNamespace("gml", "http://www.opengis.net/gml");
            nsmgr.AddNamespace("multic", "multic");
            return nsmgr;
        }
    }
}
