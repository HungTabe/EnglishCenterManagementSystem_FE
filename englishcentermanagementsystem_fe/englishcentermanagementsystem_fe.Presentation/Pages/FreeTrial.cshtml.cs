using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace englishcentermanagementsystem_fe.Presentation.Pages
{
    public class FreeTrialModel : PageModel
    {
        [BindProperty]
        public string Email { get; set; }

        public IActionResult OnPost()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            // TODO: Xử lý email (lưu vào database, gửi email, v.v.)
            return Page();
        }
    }
}
