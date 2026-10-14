using FirefightersSP.Backend.Models;
using FirefightersSP.Backend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FirefightersSP.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly JwtService _jwtService;
    
    public AuthController(
        AuthService authService,
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        JwtService jwtService)
    {
        _authService = authService;
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtService = jwtService;
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginWithCredentials(dto.Email, dto.Password);
        
        if (!result.Success)
        {
            return Unauthorized(new { message = result.Error });
        }
        
        return Ok(new 
        {
            token = result.Token,
            user = result.User
        });
    }
    
    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register([FromBody] RegisterUserDto dto)
    {
        var result = await _authService.RegisterUser(dto);
        
        if (!result.Success)
        {
            return BadRequest(new { message = result.Error });
        }
        
        return Ok(new 
        {
            token = result.Token,
            user = result.User
        });
    }
    
    [HttpGet("google")]
    public async Task<IActionResult> LoginWithGoogle(string returnUrl = "/")
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = Url.Action("GoogleCallback", new { returnUrl }),
            Items = { { "LoginProvider", GoogleDefaults.AuthenticationScheme } }
        };
        
        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }
    
    [HttpGet("google-callback")]
    public async Task<IActionResult> GoogleCallback(string returnUrl = "/")
    {
        var result = await _authService.HandleGoogleCallback();
        
        if (!result.Success)
        {
            return BadRequest(new { message = result.Error });
        }
        
        // Return a script that closes the popup and sends the token to the parent
        var script = $@"
            <script>
                window.opener.postMessage({{
                    type: 'google-auth-success',
                    token: '{result.Token}',
                    user: {{
                        id: '{result.User?.Id}',
                        email: '{result.User?.Email}',
                        nome: '{result.User?.NomeCompleto}',
                        picture: '{result.User?.PictureUrl}'
                    }}
                }}, '*');
                window.close();
            </script>
        ";
        
        return Content(script, "text/html");
    }
    
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue("userId");
        var user = await _userManager.FindByIdAsync(userId);
        
        if (user == null)
        {
            return NotFound();
        }
        
        var roles = await _userManager.GetRolesAsync(user);
        
        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            nome = user.NomeCompleto,
            cargo = user.Cargo,
            quartel = user.Quartel,
            picture = user.PictureUrl,
            telefone = user.Telefone,
            roles = roles
        });
    }
    
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok(new { message = "Logged out successfully" });
    }
    
    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = _userManager.Users.Select(u => new
        {
            u.Id,
            u.Email,
            u.NomeCompleto,
            u.Cargo,
            u.Quartel,
            u.Telefone,
            u.Ativo,
            u.DataCadastro
        }).ToList();
        
        return Ok(users);
    }
    
    [HttpGet("users/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUserById(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        
        if (user == null)
        {
            return NotFound();
        }
        
        var roles = await _userManager.GetRolesAsync(user);
        
        return Ok(new
        {
            user.Id,
            user.Email,
            user.NomeCompleto,
            user.CPF,
            user.Cargo,
            user.Quartel,
            user.Telefone,
            user.Ativo,
            user.DataCadastro,
            Roles = roles
        });
    }
    
    [HttpPut("users/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        
        if (user == null)
        {
            return NotFound();
        }
        
        user.NomeCompleto = dto.NomeCompleto;
        user.CPF = dto.CPF;
        user.Cargo = dto.Cargo;
        user.Quartel = dto.Quartel;
        user.Telefone = dto.Telefone;
        user.Ativo = dto.Ativo;
        
        var result = await _userManager.UpdateAsync(user);
        
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }
        
        // Update roles
        var currentRoles = await _userManager.GetRolesAsync(user);
        var newRoles = dto.Roles ?? new List<string>();
        
        var rolesToAdd = newRoles.Except(currentRoles);
        var rolesToRemove = currentRoles.Except(newRoles);
        
        foreach (var role in rolesToAdd)
        {
            await _userManager.AddToRoleAsync(user, role);
        }
        
        foreach (var role in rolesToRemove)
        {
            await _userManager.RemoveFromRoleAsync(user, role);
        }
        
        return Ok(new
        {
            user.Id,
            user.Email,
            user.NomeCompleto,
            user.Cargo,
            user.Quartel,
            user.Telefone,
            user.Ativo
        });
    }
    
    [HttpDelete("users/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        
        if (user == null)
        {
            return NotFound();
        }
        
        var result = await _userManager.DeleteAsync(user);
        
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }
        
        return Ok(new { message = "User deleted successfully" });
    }
    
    [HttpPost("refresh-token")]
    [Authorize]
    public async Task<IActionResult> RefreshToken()
    {
        var userId = User.FindFirstValue("userId");
        var user = await _userManager.FindByIdAsync(userId);
        
        if (user == null)
        {
            return NotFound();
        }
        
        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtService.GenerateToken(user, roles);
        
        return Ok(new { token });
    }
}

public class UpdateUserDto
{
    public string NomeCompleto { get; set; } = string.Empty;
    public string? CPF { get; set; }
    public string? Cargo { get; set; }
    public string? Quartel { get; set; }
    public string? Telefone { get; set; }
    public bool Ativo { get; set; } = true;
    public List<string>? Roles { get; set; }
}
