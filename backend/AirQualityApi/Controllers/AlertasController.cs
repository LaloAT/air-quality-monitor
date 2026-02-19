using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AirQualityApi.Data;
using AirQualityApi.Models;

namespace AirQualityApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AlertasController : ControllerBase
{
    private readonly AppDbContext _db;

    public AlertasController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>Obtiene alertas de las últimas N horas (default 24).</summary>
    [HttpGet]
    public async Task<ActionResult<List<Alerta>>> GetPorHoras([FromQuery] int horas = 24)
    {
        var desde = DateTime.UtcNow.AddHours(-horas);

        var alertas = await _db.Alertas
            .Where(a => a.Timestamp >= desde)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync();

        return alertas;
    }

    /// <summary>Conteo de alertas agrupado por variable (últimas N horas).</summary>
    [HttpGet("conteo")]
    public async Task<ActionResult<object>> GetConteo([FromQuery] int horas = 24)
    {
        var desde = DateTime.UtcNow.AddHours(-horas);

        var conteo = await _db.Alertas
            .Where(a => a.Timestamp >= desde)
            .GroupBy(a => a.Variable)
            .Select(g => new { Variable = g.Key, Total = g.Count() })
            .ToListAsync();

        return Ok(conteo);
    }
}
