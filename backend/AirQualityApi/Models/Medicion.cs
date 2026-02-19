using System.ComponentModel.DataAnnotations;

namespace AirQualityApi.Models;

public class Medicion
{
    public int Id { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public double PM25 { get; set; }

    public double PM10 { get; set; }

    public double CO2 { get; set; }

    public double TVOC { get; set; }

    public double Temperatura { get; set; }

    public double Humedad { get; set; }

    public EstadoCalidad Estado { get; set; }

    public ICollection<Alerta> Alertas { get; set; } = new List<Alerta>();
}
