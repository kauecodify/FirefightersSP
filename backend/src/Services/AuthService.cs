using System.Security.Claims;
using FirefightersSP.Backend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;

namespace FirefightersSP.Backend.Services;

public class AuthService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly JwtService _jwtService;
    private readonly IConfiguration _configuration;
    
    public AuthService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        JwtService jwtService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtService = jwtService;
        _configuration = configuration;
    }
    
    public async Task<AuthResult> LoginWithGoogle(string returnUrl = "/")
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = returnUrl,
            Items = { { "LoginProvider", GoogleDefaults.AuthenticationScheme } }
        };
        
        return new AuthResult
        {
            RedirectUrl = "/auth/google",
            Properties = properties
        };
    }
    
    public async Task<AuthResult> HandleGoogleCallback()
    {
        var result = await _signInManager.GetExternalLoginInfoAsync();
        if (result == null)
        {
            return new AuthResult { Success = false, Error = "External login info not found" };
        }
        
        // Sign in the user with this external login provider if the user already has a login
        var signInResult = await _signInManager.ExternalLoginSignInAsync(result.LoginProvider, result.ProviderKey, isPersistent: false, bypassTwoFactor: true);
        
        if (signInResult.Succeeded)
        {
            var user = await _userManager.FindByLoginAsync(result.LoginProvider, result.ProviderKey);
            if (user != null)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var token = _jwtService.GenerateToken(user, roles);
                return new AuthResult { Success = true, Token = token, User = MapUser(user) };
            }
        }
        
        // If the user does not have an account, then prompt the user to create an account
        var email = result.Principal.FindFirstValue(ClaimTypes.Email);
        var name = result.Principal.FindFirstValue(ClaimTypes.Name);
        var picture = result.Principal.FindFirstValue("picture");
        var googleId = result.ProviderKey;
        
        // Create a new user
        var user = new User
        {
            UserName = email,
            Email = email,
            NomeCompleto = name,
            PictureUrl = picture,
            GoogleId = googleId,
            EmailConfirmed = true
        };
        
        var createResult = await _userManager.CreateAsync(user);
        if (!createResult.Succeeded)
        {
            return new AuthResult { Success = false, Error = string.Join(", ", createResult.Errors.Select(e => e.Description)) };
        }
        
        // Add the external login
        var addLoginResult = await _userManager.AddLoginAsync(user, result);
        if (!addLoginResult.Succeeded)
        {
            return new AuthResult { Success = false, Error = string.Join(", ", addLoginResult.Errors.Select(e => e.Description)) };
        }
        
        // Assign User role by default
        await _userManager.AddToRoleAsync(user, "User");
        
        // Sign in the user
        await _signInManager.SignInAsync(user, isPersistent: false);
        
        // Generate JWT token
        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtService.GenerateToken(user, roles);
        
        return new AuthResult { Success = true, Token = token, User = MapUser(user) };
    }
    
    public async Task<AuthResult> LoginWithCredentials(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return new AuthResult { Success = false, Error = "Invalid credentials" };
        }
        
        var result = await _signInManager.CheckPasswordSignInAsync(user, password, false);
        if (!result.Succeeded)
        {
            return new AuthResult { Success = false, Error = "Invalid credentials" };
        }
        
        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtService.GenerateToken(user, roles);
        
        return new AuthResult { Success = true, Token = token, User = MapUser(user) };
    }
    
    public async Task<AuthResult> RegisterUser(RegisterUserDto dto)
    {
        var user = new User
        {
            UserName = dto.Email,
            Email = dto.Email,
            NomeCompleto = dto.NomeCompleto,
            CPF = dto.CPF,
            Cargo = dto.Cargo,
            Quartel = dto.Quartel,
            Telefone = dto.Telefone,
            Ativo = true,
            EmailConfirmed = true
        };
        
        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            return new AuthResult { Success = false, Error = string.Join(", ", result.Errors.Select(e => e.Description)) };
        }
        
        // Assign role based on cargo
        var role = dto.Cargo switch
        {
            "Admin" => "Admin",
            "Bombeiro" or "Motorista" => "Firefighter",
            _ => "User"
        };
        
        await _userManager.AddToRoleAsync(user, role);
        
        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtService.GenerateToken(user, roles);
        
        return new AuthResult { Success = true, Token = token, User = MapUser(user) };
    }
    
    private UserDto MapUser(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            NomeCompleto = user.NomeCompleto,
            Cargo = user.Cargo,
            Quartel = user.Quartel,
            PictureUrl = user.PictureUrl,
            Telefone = user.Telefone
        };
    }
}

public class AuthResult
{
    public bool Success { get; set; }
    public string? Token { get; set; }
    public UserDto? User { get; set; }
    public string? RedirectUrl { get; set; }
    public AuthenticationProperties? Properties { get; set; }
    public string? Error { get; set; }
}

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? NomeCompleto { get; set; }
    public string? Cargo { get; set; }
    public string? Quartel { get; set; }
    public string? PictureUrl { get; set; }
    public string? Telefone { get; set; }
}

public class RegisterUserDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string NomeCompleto { get; set; } = string.Empty;
    public string? CPF { get; set; }
    public string? Cargo { get; set; }
    public string? Quartel { get; set; }
    public string? Telefone { get; set; }
}

public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
