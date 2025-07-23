using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Http;
using System.Text.Json;
using System.Text;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

public class UserManagementModel : PageModel
{
    public List<UserDto> Users { get; set; }
    public string ErrorMessage { get; set; }

    public async Task<IActionResult> OnGetAsync()
    {
        // Only allow Admin
        if (HttpContext.Session.GetString("Role") != "0")
            return RedirectToPage("/Index");

        var client = new HttpClient();
        var token = HttpContext.Session.GetString("Token");
        if (!string.IsNullOrEmpty(token))
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
        try
        {
            var response = await client.GetAsync("https://localhost:7176/api/Users");
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                Users = JsonSerializer.Deserialize<List<UserDto>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            else
            {
                ErrorMessage = await response.Content.ReadAsStringAsync();
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        return Page();
    }

    public string GetRoleName(int role)
    {
        return role switch
        {
            0 => "Admin",
            1 => "Teacher",
            2 => "Student",
            _ => "Unknown"
        };
    }

    public class UserDto
    {
        public string Id { get; set; }
        public string FullName { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public int Role { get; set; }
        public bool IsLocked { get; set; }
        public DateTime RegistrationDate { get; set; }
    }
} 