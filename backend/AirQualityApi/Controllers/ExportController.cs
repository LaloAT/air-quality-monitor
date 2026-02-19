using System.Globalization;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AirQualityApi.Data;

namespace AirQualityApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExportController : ControllerBase
{
    private readonly AppDbContext _db;

    public ExportController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>Exporta mediciones a CSV filtradas por rango de fechas.</summary>
    [HttpGet("csv")]
    public async Task<IActionResult> ExportarCsv(
        [FromQuery] DateTime? desde = null,
        [FromQuery] DateTime? hasta = null)
    {
        var query = _db.Mediciones.AsQueryable();

        if (desde.HasValue)
            query = query.Where(m => m.Timestamp >= desde.Value.ToUniversalTime());

        if (hasta.HasValue)
            query = query.Where(m => m.Timestamp <= hasta.Value.ToUniversalTime());

        var mediciones = await query.OrderBy(m => m.Timestamp).ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("Timestamp,PM25,PM10,CO2,TVOC,Temperatura,Humedad,Estado");

        foreach (var m in mediciones)
        {
            sb.AppendLine(string.Join(",",
                m.Timestamp.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture),
                m.PM25.ToString(CultureInfo.InvariantCulture),
                m.PM10.ToString(CultureInfo.InvariantCulture),
                m.CO2.ToString(CultureInfo.InvariantCulture),
                m.TVOC.ToString(CultureInfo.InvariantCulture),
                m.Temperatura.ToString(CultureInfo.InvariantCulture),
                m.Humedad.ToString(CultureInfo.InvariantCulture),
                m.Estado));
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv", "mediciones.csv");
    }
}
