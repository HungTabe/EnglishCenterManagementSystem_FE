using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

public class LoginModel : PageModel
{
    [BindProperty] public string Email { get; set; }
    [BindProperty] public string Password { get; set; }
    public string ErrorMessage { get; set; }

    public void OnGet()
    {
        if (HttpContext.Session.GetString("Token") != null)
            Response.Redirect("/");
    }

    public async Task<IActionResult> OnPostAsync()
    {
        var client = new HttpClient();
        var loginData = new { email = Email, password = Password };
        var content = new StringContent(JsonSerializer.Serialize(loginData), Encoding.UTF8, "application/json");
        try
        {
            var response = await client.PostAsync("https://localhost:7176/api/Auth/login", content);
            if (response.IsSuccessStatusCode)
            {
                var resp = JsonSerializer.Deserialize<LoginResponseDto>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                HttpContext.Session.SetString("Token", resp.Token);
                // Convert role string to int string if needed
                string roleInt = resp.Role;
                if (roleInt.Equals("Admin", StringComparison.OrdinalIgnoreCase)) roleInt = "0";
                else if (roleInt.Equals("Teacher", StringComparison.OrdinalIgnoreCase)) roleInt = "1";
                else if (roleInt.Equals("Student", StringComparison.OrdinalIgnoreCase)) roleInt = "2";
                HttpContext.Session.SetString("Role", roleInt);
                HttpContext.Session.SetString("FullName", resp.FullName);
                // Also store in sessionStorage for JS
                Response.Cookies.Append("Token", resp.Token);
                Response.Cookies.Append("Role", roleInt);
                // Add script to set sessionStorage
                TempData["SetSessionStorage"] = $@"
                    <script>
                        sessionStorage.setItem('Token', '{resp.Token}');
                        sessionStorage.setItem('Role', '{roleInt}');
                    </script>
                ";
                return RedirectToPage("/Index");
            }
            else
            {
                ErrorMessage = await response.Content.ReadAsStringAsync();
                return Page();
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = "Login failed: " + ex.Message;
            return Page();
        }
    }

    public class LoginResponseDto
    {
        public string Token { get; set; }
        public string Role { get; set; }
        public string FullName { get; set; }
    }
} 