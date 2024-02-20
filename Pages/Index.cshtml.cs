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
            ViewData["wmsurl"] = _configuration["wmsurl"];
            ViewData["wmslayer"] = _configuration["wmslayer"];
        }
    }
}
