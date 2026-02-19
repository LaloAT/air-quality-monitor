using Microsoft.EntityFrameworkCore;
using AirQualityApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Entity Framework Core + SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Controllers
builder.Services.AddControllers();

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS permisivo (para desarrollo y para que el frontend en GitHub Pages pueda conectarse)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Auto-crear la base de datos al iniciar
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Swagger siempre habilitado (útil para demo y testing)
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();

app.MapControllers();

// Puerto configurable por variable de entorno PORT (para Railway), default 5000
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Run($"http://0.0.0.0:{port}");
