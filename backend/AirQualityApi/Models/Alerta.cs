using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQualityApi.Models;

public class Alerta
{
    public int Id { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [Required]
    public string Variable { get; set; } = string.Empty;

    public double Valor { get; set; }

    public double Umbral { get; set; }

    [Required]
    public string Mensaje { get; set; } = string.Empty;

    public int MedicionId { get; set; }

    [ForeignKey(nameof(MedicionId))]
    public Medicion Medicion { get; set; } = null!;
}
