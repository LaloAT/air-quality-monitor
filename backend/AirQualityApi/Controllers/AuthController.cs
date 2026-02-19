using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using AirQualityApi.Models;

namespace AirQualityApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    /// <summary>Login con usuario y contraseña. Devuelve JWT token.</summary>
    [HttpPost("login")]
    public ActionResult<LoginResponse> Login([FromBody] LoginRequest request)
    {
        var username = _config["Auth:Username"];
        var password = _config["Auth:Password"];

        if (request.Usuario != username || request.Contraseña != password)
            return Unauthorized(new { mensaje = "Credenciales inválidas" });

        var secret = _config["Auth:JwtSecret"]!;
        var hours = int.Parse(_config["Auth:JwtExpirationHours"] ?? "24");
        var expiracion = DateTime.UtcNow.AddHours(hours);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, request.Usuario),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: "AirQualityApi",
            audience: "AirQualityApi",
            claims: claims,
            expires: expiracion,
            signingCredentials: creds);

        return Ok(new LoginResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Expiracion = expiracion
        });
    }
}
