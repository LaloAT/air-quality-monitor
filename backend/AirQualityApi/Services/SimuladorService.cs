using AirQualityApi.Models;

namespace AirQualityApi.Services;

public class SimuladorService
{
    private readonly Random _rng = new();

    // Medias y desviaciones estándar realistas para León, Guanajuato
    private static readonly (double media, double desv) PM25  = (18.0, 8.0);
    private static readonly (double media, double desv) PM10  = (30.0, 12.0);
    private static readonly (double media, double desv) CO2   = (620.0, 150.0);
    private static readonly (double media, double desv) TVOC  = (90.0, 50.0);
    private static readonly (double media, double desv) Temp  = (25.0, 4.0);
    private static readonly (double media, double desv) Hum   = (48.0, 12.0);

    public Medicion GenerarMedicion()
    {
        bool esPico = _rng.NextDouble() < 0.10;
        double factor = esPico ? 2.5 : 1.0;

        return new Medicion
        {
            Timestamp = DateTime.UtcNow,
            PM25 = Clamp(Gaussiana(PM25.media * factor, PM25.desv * factor), 0, 500),
            PM10 = Clamp(Gaussiana(PM10.media * factor, PM10.desv * factor), 0, 600),
            CO2 = Clamp(Gaussiana(CO2.media * factor, CO2.desv * factor), 400, 5000),
            TVOC = Clamp(Gaussiana(TVOC.media * factor, TVOC.desv * factor), 0, 2000),
            Temperatura = Clamp(Gaussiana(Temp.media, Temp.desv), -10, 55),
            Humedad = Clamp(Gaussiana(Hum.media, Hum.desv), 0, 100)
        };
    }

    public Medicion GenerarMedicionAlerta()
    {
        return new Medicion
        {
            Timestamp = DateTime.UtcNow,
            PM25 = Clamp(Gaussiana(55, 15), 36, 500),
            PM10 = Clamp(Gaussiana(70, 20), 51, 600),
            CO2 = Clamp(Gaussiana(1400, 200), 1001, 5000),
            TVOC = Clamp(Gaussiana(350, 80), 221, 2000),
            Temperatura = Clamp(Gaussiana(38, 3), 30, 55),
            Humedad = Clamp(Gaussiana(75, 10), 40, 100)
        };
    }

    public List<Medicion> GenerarHistorial(int cantidad, int intervaloMinutos = 5)
    {
        var mediciones = new List<Medicion>(cantidad);
        var ahora = DateTime.UtcNow;

        for (int i = cantidad - 1; i >= 0; i--)
        {
            var m = GenerarMedicion();
            m.Timestamp = ahora.AddMinutes(-i * intervaloMinutos);
            mediciones.Add(m);
        }

        return mediciones;
    }

    // Box-Muller transform
    private double Gaussiana(double media, double desv)
    {
        double u1 = 1.0 - _rng.NextDouble();
        double u2 = 1.0 - _rng.NextDouble();
        double normal = Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);
        return Math.Round(media + desv * normal, 1);
    }

    private static double Clamp(double valor, double min, double max)
    {
        return Math.Max(min, Math.Min(max, valor));
    }
}
