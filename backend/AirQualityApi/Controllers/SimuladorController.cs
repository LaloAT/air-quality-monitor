using Microsoft.AspNetCore.Mvc;
using AirQualityApi.Data;
using AirQualityApi.Models;
using AirQualityApi.Services;

namespace AirQualityApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SimuladorController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SimuladorService _simulador;
    private readonly AlertaService _alertas;

    public SimuladorController(AppDbContext db, SimuladorService simulador, AlertaService alertas)
    {
        _db = db;
        _simulador = simulador;
        _alertas = alertas;
    }

    /// <summary>Genera y guarda una medición simulada normal.</summary>
    [HttpPost("generar")]
    public async Task<ActionResult<Medicion>> Generar()
    {
        var m = _simulador.GenerarMedicion();
        m.Estado = _alertas.EvaluarEstado(m);

        _db.Mediciones.Add(m);
        await _db.SaveChangesAsync();
        await _alertas.GenerarAlertasAsync(m);

        return CreatedAtAction(null, m);
    }

    /// <summary>Genera y guarda una medición con valores sobre umbrales (para probar alertas).</summary>
    [HttpPost("alerta")]
    public async Task<ActionResult<Medicion>> GenerarAlerta()
    {
        var m = _simulador.GenerarMedicionAlerta();
        m.Estado = _alertas.EvaluarEstado(m);

        _db.Mediciones.Add(m);
        await _db.SaveChangesAsync();
        await _alertas.GenerarAlertasAsync(m);

        return CreatedAtAction(null, m);
    }

    /// <summary>Genera N mediciones históricas con intervalo de 5 min (default 288 = 24 horas).</summary>
    [HttpPost("historial")]
    public async Task<ActionResult<object>> GenerarHistorial([FromQuery] int cantidad = 288)
    {
        var mediciones = _simulador.GenerarHistorial(cantidad);
        int totalAlertas = 0;

        foreach (var m in mediciones)
        {
            m.Estado = _alertas.EvaluarEstado(m);
            _db.Mediciones.Add(m);
            await _db.SaveChangesAsync();

            var alertas = await _alertas.GenerarAlertasAsync(m);
            totalAlertas += alertas.Count;
        }

        return CreatedAtAction(null, null, new
        {
            Mediciones = mediciones.Count,
            Alertas = totalAlertas,
            Desde = mediciones.First().Timestamp,
            Hasta = mediciones.Last().Timestamp
        });
    }
}
