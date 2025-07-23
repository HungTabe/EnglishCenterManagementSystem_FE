using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace englishcentermanagementsystem_fe.Presentation.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;

        public IndexModel(ILogger<IndexModel> logger)
        {
            _logger = logger;
        }

        public IActionResult OnGet()
        {
            var path = HttpContext.Request.Path.Value?.ToLower();
            if (HttpContext.Session.GetString("Token") == null && path != "/login" && path != "/register" && path != "/freetrial")
            {
                return RedirectToPage("/Login");
            }
            return Page();
        }
    }
}
