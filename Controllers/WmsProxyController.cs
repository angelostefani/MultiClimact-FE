using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Xml;
using Newtonsoft.Json;
using System.Text.Json;

namespace MultiClimact.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WmsProxyController(HttpClient httpClient, ILogger<WmsProxyController> logger, IConfiguration configuration) : ControllerBase
    {

        private readonly HttpClient _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));

        private readonly ILogger<WmsProxyController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        private readonly string _wmsBaseUrl = configuration["wms:wmsurl_baseurl"]
            ?? configuration["wms:wmsurl_earth_real_view"]
            ?? string.Empty;

        public string WmsBaseUrl => _wmsBaseUrl;

        public string WmsBaseUrl1 => _wmsBaseUrl;

        [HttpGet("GetFeatureInfo")]
        public async Task<IActionResult> GetFeatureInfo(
            [FromQuery] string bbox,
            [FromQuery] string x,
            [FromQuery] string y,
            [FromQuery] string width,
            [FromQuery] string height,
            [FromQuery] string layer,
            [FromQuery] string? cqlFilter)
        {
            if (string.IsNullOrEmpty(bbox) || string.IsNullOrEmpty(x) || string.IsNullOrEmpty(y) ||
                string.IsNullOrEmpty(width) || string.IsNullOrEmpty(height) || string.IsNullOrEmpty(layer))
            {
                _logger.LogWarning("Parametri mancanti: bbox, x, y, width, height e layer sono richiesti.");
                return BadRequest("Parametri mancanti: bbox, x, y, width, height e layer sono richiesti.");
            }

            if (string.IsNullOrWhiteSpace(_wmsBaseUrl) || !Uri.TryCreate(_wmsBaseUrl, UriKind.Absolute, out _))
            {
                _logger.LogError("Configurazione WMS non valida. Valore corrente wms:wmsurl_baseurl='{wmsBaseUrl}'", _wmsBaseUrl);
                return StatusCode(500, "Configurazione WMS non valida (wms:wmsurl_baseurl).");
            }

            //da rivedere (provare ad usare la getFeatureInfo di OpenLayer)
            // _wmsBaseUrl = "http://192.168.154.23:8180/geoserver/multic/wms";

            
              string wmsUrl = $"{_wmsBaseUrl}?" +
                             $"service=WMS&REQUEST=GetFeatureInfo&QUERY_LAYERS={layer}&" +
                             $"VERSION=1.1.1&FORMAT=image/png&TRANSPARENT=true&LAYERS={layer}&" +
                             $"INFO_FORMAT=text/html&FEATURE_COUNT=5&X={x}&Y={y}&WIDTH={width}&HEIGHT={height}&CRS=EPSG:3857&BBOX={bbox}";

            if (!string.IsNullOrWhiteSpace(cqlFilter))
            {
                wmsUrl += $"&CQL_FILTER={Uri.EscapeDataString(cqlFilter)}";
            }
            

            /** string wmsUrl = $"{_wmsBaseUrl}?" +
                            $"service=WMS&REQUEST=GetFeatureInfo&QUERY_LAYERS={layer}&" +
                            $"VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&LAYERS={layer}&" +
                            $"INFO_FORMAT=text/xml&I={x}&J={y}&WIDTH={width}&HEIGHT={height}&CRS=EPSG:3857&BBOX={bbox}";
            **/
           // string wmsUrl = "http://192.168.154.23:8180/geoserver/multic/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=multic%3Aearth_real_view%2Cmultic%3Ashakemap&STYLES&LAYERS=multic%3Aearth_real_view%2Cmultic%3Ashakemap&exceptions=application%2Fvnd.ogc.se_inimage&INFO_FORMAT=text%2Fhtml&FEATURE_COUNT=50&X=50&Y=50&SRS=EPSG%3A4326&WIDTH=101&HEIGHT=101&BBOX=13.060913092943625%2C42.87643429777443%2C13.19961548552175%2C43.015136690352556";
            
            Console.WriteLine(_wmsBaseUrl);
            Console.Out.Flush();
            _logger.LogInformation("Requesting WMS URL: {wmsUrl}", wmsUrl);

            try
            {
                var response = await _httpClient.GetAsync(wmsUrl);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("Risposta del server: {content}", content);
                    // Rileva risposte XML/HTML e applica parsing robusto
                    if (IsXml(content))
                    {
                        var xmlDoc = new XmlDocument();
                        xmlDoc.LoadXml(content);
                        _logger.LogInformation("parsing XML: {content}", content);
                        // Gestione di report di eccezione OGC
                        var rootLocal = xmlDoc.DocumentElement?.LocalName?.ToLowerInvariant();
                        if (rootLocal is "serviceexceptionreport" or "exceptionreport")
                        {
                            return StatusCode(502, "OGC Service Exception nella GetFeatureInfo");
                        }

                        _logger.LogInformation("rootLocal e': {rootLocal}", rootLocal);
                        var jsonResult = BuildGenericFeatureInfoJson(xmlDoc, layer);
                      //  string jsonResulta = "{\"layer\":\"multic:riverflood_rb_view\",\"properties\":{\"id\":\"9397\",\"coordinates\": \"12.414,43.663\"}}";
                        if (jsonResult is not null)
                        {
                            string jsonResultB = jsonResult.ToString();
                            _logger.LogInformation("Risposta JSON: {jsonResult}", jsonResultB);
                            return Ok(jsonResultB);
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

        private static bool IsValidJson(string json, out string? error)
        {
            try
            {
                using var _ = JsonDocument.Parse(json); // se non è valido lancia
                error = null;
                return false;
            }
            catch (System.Text.Json.JsonException ex)
            {
                error = ex.Message; // posizione errore, ecc.
                return true;
            }
        }



    }


}
