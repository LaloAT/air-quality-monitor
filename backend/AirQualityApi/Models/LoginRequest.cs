using System.ComponentModel.DataAnnotations;

namespace AirQualityApi.Models;

public class LoginRequest
{
    [Required]
    public string Usuario { get; set; } = string.Empty;

    [Required]
    public string Contraseña { get; set; } = string.Empty;
}
