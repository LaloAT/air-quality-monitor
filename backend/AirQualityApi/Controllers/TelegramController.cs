using Microsoft.AspNetCore.Mvc;
using AirQualityApi.Services;

namespace AirQualityApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TelegramController : ControllerBase
{
    private readonly SimuladorService _simulador;
    private readonly AlertaService _alertas;
    private readonly TelegramEmisorService _emisor;
    private readonly TelegramLectorService _lector;

    public TelegramController(
        SimuladorService simulador,
        AlertaService alertas,
        TelegramEmisorService emisor,
        TelegramLectorService lector)
    {
        _simulador = simulador;
        _alertas = alertas;
        _emisor = emisor;
        _lector = lector;
    }

    /// <summary>Genera una medición simulada y la envía al bot de Telegram.</summary>
    [HttpPost("simular")]
    public async Task<ActionResult> Simular()
    {
        var m = _simulador.GenerarMedicion();
        m.Estado = _alertas.EvaluarEstado(m);

        await _emisor.EnviarMedicionAsync(m);

        return Ok(new { mensaje = "Medición enviada a Telegram", medicion = m });
    }

    /// <summary>Genera una medición con valores altos y la envía al bot (con alerta).</summary>
    [HttpPost("simular-alerta")]
    public async Task<ActionResult> SimularAlerta()
    {
        var m = _simulador.GenerarMedicionAlerta();
        m.Estado = _alertas.EvaluarEstado(m);

        await _emisor.EnviarMedicionAsync(m);
        await _emisor.EnviarAlertaAsync(m);

        return Ok(new { mensaje = "Medición + alerta enviadas a Telegram", medicion = m });
    }

    /// <summary>Estado del bot: conectado y mensajes procesados.</summary>
    [HttpGet("status")]
    public ActionResult GetStatus()
    {
        return Ok(new
        {
            conectado = _lector.Conectado,
            mensajesProcesados = _lector.MensajesProcesados
        });
    }
}
