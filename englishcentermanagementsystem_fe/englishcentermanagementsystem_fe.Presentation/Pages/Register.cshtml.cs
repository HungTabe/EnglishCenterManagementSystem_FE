using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

public class RegisterModel : PageModel
{
    [BindProperty] public string FullName { get; set; }
    [BindProperty] public string UserName { get; set; }
    [BindProperty] public string Email { get; set; }
    [BindProperty] public string Password { get; set; }
    [BindProperty] public string Role { get; set; }
    public string ErrorMessage { get; set; }
    public string SuccessMessage { get; set; }

    public void OnGet() { }

    public async Task<IActionResult> OnPostAsync()
    {
        var client = new HttpClient();
        int roleInt = Role == "Teacher" ? 1 : 2; // 1: Teacher, 2: Student
        var registerData = new { fullName = FullName, userName = UserName, email = Email, password = Password, role = roleInt };
        var content = new StringContent(JsonSerializer.Serialize(registerData), Encoding.UTF8, "application/json");
        try
        {
            var response = await client.PostAsync("https://localhost:7176/api/Auth/register", content);
            var respContent = await response.Content.ReadAsStringAsync();
            if (response.IsSuccessStatusCode)
            {
                return RedirectToPage("/Login");
            }
            else
            {
                ErrorMessage = respContent;
                SuccessMessage = null;
                return Page();
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = "Registration failed: " + ex.Message;
            SuccessMessage = null;
            return Page();
        }
    }
} 