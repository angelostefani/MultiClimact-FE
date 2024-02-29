using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MultiClimact.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly IConfiguration _configuration;

        public IndexModel(ILogger<IndexModel> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;           
        }

        public void OnGet()
        {
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
            
        }
    }
}
