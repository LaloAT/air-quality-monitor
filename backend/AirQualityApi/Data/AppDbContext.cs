using Microsoft.EntityFrameworkCore;
using AirQualityApi.Models;

namespace AirQualityApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Medicion> Mediciones => Set<Medicion>();
    public DbSet<Alerta> Alertas => Set<Alerta>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Medicion>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Timestamp).IsRequired();
            entity.Property(e => e.Estado).HasConversion<string>();
        });

        modelBuilder.Entity<Alerta>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(a => a.Medicion)
                  .WithMany(m => m.Alertas)
                  .HasForeignKey(a => a.MedicionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
