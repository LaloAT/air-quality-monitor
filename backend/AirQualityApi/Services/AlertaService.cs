using AirQualityApi.Data;
using AirQualityApi.Models;

namespace AirQualityApi.Services;

public class AlertaService
{
    private readonly AppDbContext _db;

    public AlertaService(AppDbContext db)
    {
        _db = db;
    }

    public EstadoCalidad EvaluarEstado(Medicion m)
    {
        if (m.CO2 > 1200 || m.PM25 > 35 || m.TVOC > 200)
            return EstadoCalidad.Malo;

        if (m.CO2 > 900 || m.PM25 > 15 || m.TVOC > 120)
            return EstadoCalidad.Regular;

        return EstadoCalidad.Bueno;
    }

    public async Task<List<Alerta>> GenerarAlertasAsync(Medicion m)
    {
        var alertas = new List<Alerta>();

        if (m.PM25 > 35)
            alertas.Add(CrearAlerta(m, "PM2.5", m.PM25, 35, "µg/m³"));

        if (m.PM10 > 50)
            alertas.Add(CrearAlerta(m, "PM10", m.PM10, 50, "µg/m³"));

        if (m.CO2 > 1000)
            alertas.Add(CrearAlerta(m, "CO₂", m.CO2, 1000, "ppm"));

        if (m.TVOC > 220)
            alertas.Add(CrearAlerta(m, "TVOC", m.TVOC, 220, "ppb"));

        if (m.Temperatura > 40)
            alertas.Add(CrearAlerta(m, "Temperatura", m.Temperatura, 40, "°C"));

        if (alertas.Count > 0)
        {
            _db.Alertas.AddRange(alertas);
            await _db.SaveChangesAsync();
        }

        return alertas;
    }

    private static Alerta CrearAlerta(Medicion m, string variable, double valor, double umbral, string unidad)
    {
        return new Alerta
        {
            Timestamp = DateTime.UtcNow,
            Variable = variable,
            Valor = Math.Round(valor, 1),
            Umbral = umbral,
            Mensaje = $"{variable}: {valor:F1} {unidad} (umbral: {umbral} {unidad}) — Ventilación recomendada",
            MedicionId = m.Id
        };
    }
}
