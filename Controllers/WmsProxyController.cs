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
        private readonly string _wmsBaseUrl = configuration["wms:wmsurl_lay13"];

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
            
            //da rivedere (provare ad usare la getFeatureInfo di OpenLayer)
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

                    // Rileva risposte XML/HTML e applica parsing robusto
                    if (IsXml(content))
                    {
                        var xmlDoc = new XmlDocument();
                        xmlDoc.LoadXml(content);

                        // Gestione di report di eccezione OGC
                        var rootLocal = xmlDoc.DocumentElement?.LocalName?.ToLowerInvariant();
                        if (rootLocal is "serviceexceptionreport" or "exceptionreport")
                        {
                            return StatusCode(502, "OGC Service Exception nella GetFeatureInfo");
                        }

                        var jsonResult = BuildGenericFeatureInfoJson(xmlDoc, layer);
                        if (jsonResult is not null)
                        {
                            return Ok(jsonResult);
                        }

                        return NotFound("Nessuna informazione trovata per il punto selezionato.");
                    }

                    // Se non XML (es. HTML o testo), restituisci contenuto grezzo come campo 'raw'
                    var raw = new JObject
                    {
                        ["layer"] = layer,
                        ["raw"] = content
                    };
                    return Ok(raw);
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
            // Namespace del workspace (non necessario con local-name(), ma lo manteniamo per completezza)
            nsmgr.AddNamespace("multic", "multic");
            return nsmgr;
        }

        private static bool IsXml(string content)
        {
            if (string.IsNullOrWhiteSpace(content)) return false;
            var trimmed = content.TrimStart();
            return trimmed.StartsWith("<") && trimmed.Contains(">");
        }

        private static JObject? BuildGenericFeatureInfoJson(XmlDocument xmlDoc, string layer)
        {
            // Prova a individuare il primo nodo 'feature' per il layer richiesto, ignorando i namespaces
            var localLayerName = layer.Contains(":") ? layer.Split(':')[1] : layer;
            XmlNode? featureNode = xmlDoc.SelectSingleNode($"//*[local-name()='{localLayerName}']");

            // Fallback: primo figlio di un featureMember o Members
            featureNode ??= xmlDoc.SelectSingleNode("//*[local-name()='featureMember']/*[1] | //*[local-name()='FeatureCollection']/*[local-name()='member']/*[1]");

            // Se ancora nulla, prova a usare il primo elemento che non sia wrapper noti
            featureNode ??= xmlDoc.DocumentElement;
            if (featureNode is null) return null;

            // Estrai le coppie chiave/valore dai nodi foglia, ignorando wrapper/geometry
            var properties = new JObject();
            foreach (XmlNode leaf in featureNode.SelectNodes(".//*[not(*)]")!)
            {
                var name = leaf.LocalName;
                if (string.IsNullOrWhiteSpace(name)) continue;
                // Escludi alcuni campi tecnici comuni
                var n = name.ToLowerInvariant();
                if (n is "boundedby" or "the_geom" or "geom" or "poslist" or "exterior" or "interior")
                    continue;

                var value = (leaf.InnerText ?? string.Empty).Trim();
                if (value.Length == 0) continue;

                if (properties[name] is null)
                {
                    properties[name] = value;
                }
            }

            if (!properties.HasValues) return null;

            // Mappa di comodo per i campi noti (se presenti)
            static string? FindProp(JObject props, params string[] keys)
            {
                foreach (var k in keys)
                {
                    foreach (var p in props.Properties())
                    {
                        if (string.Equals(p.Name, k, System.StringComparison.OrdinalIgnoreCase))
                        {
                            return p.Value?.ToString();
                        }
                    }
                }
                return null;
            }

            var result = new JObject
            {
                ["layer"] = layer,
                ["properties"] = properties
            };

            // Copia opzionale dei campi noti se presenti
            var lat = FindProp(properties, "lat", "latitude");
            var lon = FindProp(properties, "lon", "long", "longitude");
            var residents = FindProp(properties, "residents", "abitanti", "population");
            var seismicV = FindProp(properties, "seismic_v", "seismicv", "seismic", "pga", "pgv");
            var vs30 = FindProp(properties, "vs30");
            var region = FindProp(properties, "region", "regione");
            var town = FindProp(properties, "town", "comune", "citta", "city");

            if (lat is not null) result["lat"] = lat;
            if (lon is not null) result["lon"] = lon;
            if (residents is not null) result["residents"] = residents;
            if (seismicV is not null) result["seismic_v"] = seismicV;
            if (vs30 is not null) result["vs30"] = vs30;
            if (region is not null) result["region"] = region;
            if (town is not null) result["town"] = town;

            return result;
        }
    }
}
