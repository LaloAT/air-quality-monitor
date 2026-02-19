using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AirQualityApi.Data;
using AirQualityApi.Models;
using AirQualityApi.Services;

namespace AirQualityApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicionesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AlertaService _alertas;

    public MedicionesController(AppDbContext db, AlertaService alertas)
    {
        _db = db;
        _alertas = alertas;
    }

    /// <summary>Obtiene la última medición registrada.</summary>
    [HttpGet("ultima")]
    public async Task<ActionResult<Medicion>> GetUltima()
    {
        var medicion = await _db.Mediciones
            .OrderByDescending(m => m.Timestamp)
            .FirstOrDefaultAsync();

        if (medicion is null)
            return NotFound("No hay mediciones registradas.");

        return medicion;
    }

    /// <summary>Obtiene mediciones de las últimas N horas (default 24).</summary>
    [HttpGet]
    public async Task<ActionResult<List<Medicion>>> GetPorHoras([FromQuery] int horas = 24)
    {
        var desde = DateTime.UtcNow.AddHours(-horas);

        var mediciones = await _db.Mediciones
            .Where(m => m.Timestamp >= desde)
            .OrderBy(m => m.Timestamp)
            .ToListAsync();

        return mediciones;
    }

    /// <summary>Registra una nueva medición, evalúa estado y genera alertas.</summary>
    [HttpPost]
    public async Task<ActionResult<Medicion>> Post([FromBody] Medicion medicion)
    {
        medicion.Estado = _alertas.EvaluarEstado(medicion);

        if (medicion.Timestamp == default)
            medicion.Timestamp = DateTime.UtcNow;

        _db.Mediciones.Add(medicion);
        await _db.SaveChangesAsync();

        await _alertas.GenerarAlertasAsync(medicion);

        return CreatedAtAction(nameof(GetUltima), null, medicion);
    }
}
