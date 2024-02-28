using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MultiClimact.Pages
{
    public class Index1Model : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly IConfiguration _configuration;

        public Index1Model(ILogger<IndexModel> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public void OnGet()
        {
            ViewData["wmsurl1"] = _configuration["wms:wmsurl1"];
            ViewData["wmslayer1"] = _configuration["wms:wmslayer1"];
        }
    }
}