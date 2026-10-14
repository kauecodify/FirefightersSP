using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FirefightersSP.Backend.Models;
using Microsoft.IdentityModel.Tokens;

namespace FirefightersSP.Backend.Services;

public class JwtService
{
    private readonly IConfiguration _configuration;
    
    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    public string GenerateToken(User user, IEnumerable<string> roles)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "YOUR_SUPER_SECRET_JWT_KEY_1234567890");
        
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim(JwtRegisteredClaimNames.Name, user.NomeCompleto ?? user.UserName ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("userId", user.Id),
            new Claim("email", user.Email ?? ""),
            new Claim("nome", user.NomeCompleto ?? ""),
            new Claim("cargo", user.Cargo ?? ""),
            new Claim("quartel", user.Quartel ?? ""),
            new Claim("picture", user.PictureUrl ?? "")
        };
        
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(24),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature),
            Issuer = _configuration["Jwt:Issuer"] ?? "FirefightersSP",
            Audience = _configuration["Jwt:Audience"] ?? "FirefightersSP"
        };
        
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
    
    public string? GetUserIdFromToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "YOUR_SUPER_SECRET_JWT_KEY_1234567890");
        
        try
        {
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _configuration["Jwt:Issuer"] ?? "FirefightersSP",
                ValidateAudience = true,
                ValidAudience = _configuration["Jwt:Audience"] ?? "FirefightersSP",
                ValidateLifetime = true
            }, out SecurityToken validatedToken);
            
            var jwtToken = (JwtSecurityToken)validatedToken;
            return jwtToken.Claims.First(x => x.Type == "userId").Value;
        }
        catch
        {
            return null;
        }
    }
}
