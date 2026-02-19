using Telegram.Bot;
using AirQualityApi.Models;

namespace AirQualityApi.Services;

public class TelegramEmisorService
{
    private readonly TelegramBotClient _bot;
    private readonly long _chatId;
    private readonly ILogger<TelegramEmisorService> _logger;

    public TelegramEmisorService(IConfiguration config, ILogger<TelegramEmisorService> logger)
    {
        _logger = logger;
        var token = config["Telegram:BotToken"]!;
        _chatId = long.Parse(config["Telegram:ChatId"]!);
        _bot = new TelegramBotClient(token);
    }

    public async Task EnviarMedicionAsync(Medicion m)
    {
        var estado = m.Estado switch
        {
            EstadoCalidad.Bueno => "✅ Good",
            EstadoCalidad.Regular => "⚠️ Regular",
            EstadoCalidad.Malo => "🔴 Bad",
            _ => "❓ Unknown"
        };

        var mensaje =
            $"📊 Air Quality Report\n" +
            $"🌡 Temp: {m.Temperatura:F1} °C\n" +
            $"💧 Humidity: {m.Humedad:F1}%\n" +
            $"💨 CO₂: {m.CO2:F0} ppm\n" +
            $"🌫 PM2.5: {m.PM25:F1} µg/m³\n" +
            $"🌫 PM10: {m.PM10:F1} µg/m³\n" +
            $"🧪 TVOC: {m.TVOC:F0} ppb\n" +
            $"Status: {estado}";

        await _bot.SendMessage(_chatId, mensaje);
        _logger.LogInformation("Medición enviada a Telegram");
    }

    public async Task EnviarAlertaAsync(Medicion m)
    {
        var lineas = new List<string> { "⚠️ ALERTA: Calidad del Aire" };

        if (m.PM25 > 35)
            lineas.Add($"PM2.5: {m.PM25:F1} µg/m³ (umbral: 35 µg/m³)");
        if (m.PM10 > 50)
            lineas.Add($"PM10: {m.PM10:F1} µg/m³ (umbral: 50 µg/m³)");
        if (m.CO2 > 1000)
            lineas.Add($"CO₂: {m.CO2:F0} ppm (umbral: 1000 ppm)");
        if (m.TVOC > 220)
            lineas.Add($"TVOC: {m.TVOC:F0} ppb (umbral: 220 ppb)");
        if (m.Temperatura > 40)
            lineas.Add($"Temperatura: {m.Temperatura:F1} °C (umbral: 40 °C)");

        if (lineas.Count > 1)
        {
            lineas.Add("Acción: Ventilación recomendada");
            await _bot.SendMessage(_chatId, string.Join("\n", lineas));
            _logger.LogWarning("Alerta enviada a Telegram");
        }
    }

    public async Task<bool> ProbarConexionAsync()
    {
        try
        {
            await _bot.GetMe();
            return true;
        }
        catch
        {
            return false;
        }
    }
}
