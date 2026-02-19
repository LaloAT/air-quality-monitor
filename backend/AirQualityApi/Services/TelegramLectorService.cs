using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Telegram.Bot;
using AirQualityApi.Data;
using AirQualityApi.Models;

namespace AirQualityApi.Services;

public class TelegramLectorService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly TelegramBotClient _bot;
    private readonly long _chatId;
    private readonly int _intervaloSegundos;
    private readonly ILogger<TelegramLectorService> _logger;
    private int? _offset;

    public int MensajesProcesados { get; private set; }
    public bool Conectado { get; private set; }

    public TelegramLectorService(IConfiguration config, IServiceProvider services, ILogger<TelegramLectorService> logger)
    {
        _services = services;
        _logger = logger;
        var token = config["Telegram:BotToken"]!;
        _chatId = long.Parse(config["Telegram:ChatId"]!);
        _intervaloSegundos = int.Parse(config["Telegram:PollingIntervalSeconds"] ?? "30");
        _bot = new TelegramBotClient(token);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("TelegramLectorService iniciado. Polling cada {s}s", _intervaloSegundos);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var updates = await _bot.GetUpdates(_offset, timeout: 2, cancellationToken: stoppingToken);
                Conectado = true;

                foreach (var update in updates)
                {
                    _offset = update.Id + 1;

                    if (update.Message?.Text is not { } texto)
                        continue;

                    if (update.Message.Chat.Id != _chatId)
                        continue;

                    if (!texto.Contains("Air Quality Report"))
                        continue;

                    var medicion = ParsearMensaje(texto);
                    if (medicion is not null)
                    {
                        await GuardarMedicionAsync(medicion);
                        MensajesProcesados++;
                        _logger.LogInformation("Medición parseada de Telegram y guardada (total: {n})", MensajesProcesados);
                    }
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                Conectado = false;
                _logger.LogError(ex, "Error en TelegramLectorService");
            }

            await Task.Delay(TimeSpan.FromSeconds(_intervaloSegundos), stoppingToken);
        }
    }

    private async Task GuardarMedicionAsync(Medicion medicion)
    {
        using var scope = _services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var alertaService = scope.ServiceProvider.GetRequiredService<AlertaService>();

        medicion.Estado = alertaService.EvaluarEstado(medicion);
        db.Mediciones.Add(medicion);
        await db.SaveChangesAsync();
        await alertaService.GenerarAlertasAsync(medicion);
    }

    private static Medicion? ParsearMensaje(string texto)
    {
        try
        {
            return new Medicion
            {
                Timestamp = DateTime.UtcNow,
                Temperatura = ExtraerValor(texto, @"Temp:\s*([\d.]+)"),
                Humedad = ExtraerValor(texto, @"Humidity:\s*([\d.]+)"),
                CO2 = ExtraerValor(texto, @"CO[₂2]:\s*([\d.]+)"),
                PM25 = ExtraerValor(texto, @"PM2\.5:\s*([\d.]+)"),
                PM10 = ExtraerValor(texto, @"PM10:\s*([\d.]+)"),
                TVOC = ExtraerValor(texto, @"TVOC:\s*([\d.]+)")
            };
        }
        catch
        {
            return null;
        }
    }

    private static double ExtraerValor(string texto, string patron)
    {
        var match = Regex.Match(texto, patron);
        if (!match.Success)
            throw new FormatException($"No se encontró patrón: {patron}");

        return double.Parse(match.Groups[1].Value, CultureInfo.InvariantCulture);
    }
}
