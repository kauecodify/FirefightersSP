using FirefightersSP.Backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FirefightersSP.Backend.Data;

public class ApplicationDbContext : IdentityDbContext<User>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Viatura> Viatura { get; set; }
    public DbSet<Plantao> Plantao { get; set; }
    public DbSet<PlantaoViatura> PlantaoViatura { get; set; }
    public DbSet<PlantaoBombeiro> PlantaoBombeiro { get; set; }
    public DbSet<Solicitacao> Solicitacao { get; set; }
    public DbSet<SolicitacaoViatura> SolicitacaoViatura { get; set; }
    public DbSet<SolicitacaoHistorico> SolicitacaoHistorico { get; set; }
    public DbSet<Sensor> Sensor { get; set; }
    public DbSet<SensorLeitura> SensorLeitura { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure PlantaoViatura
        builder.Entity<PlantaoViatura>()
            .HasKey(pv => new { pv.PlantaoId, pv.ViaturaId });

        builder.Entity<PlantaoViatura>()
            .HasOne(pv => pv.Plantao)
            .WithMany(p => p.PlantaoViatura)
            .HasForeignKey(pv => pv.PlantaoId);

        builder.Entity<PlantaoViatura>()
            .HasOne(pv => pv.Viatura)
            .WithMany(v => v.PlantaoViatura)
            .HasForeignKey(pv => pv.ViaturaId);

        // Configure PlantaoBombeiro
        builder.Entity<PlantaoBombeiro>()
            .HasKey(pb => new { pb.PlantaoId, pb.UserId });

        builder.Entity<PlantaoBombeiro>()
            .HasOne(pb => pb.Plantao)
            .WithMany(p => p.PlantaoBombeiro)
            .HasForeignKey(pb => pb.PlantaoId);

        builder.Entity<PlantaoBombeiro>()
            .HasOne(pb => pb.User)
            .WithMany()
            .HasForeignKey(pb => pb.UserId);

        // Configure SolicitacaoViatura
        builder.Entity<SolicitacaoViatura>()
            .HasKey(sv => new { sv.SolicitacaoId, sv.ViaturaId });

        builder.Entity<SolicitacaoViatura>()
            .HasOne(sv => sv.Solicitacao)
            .WithMany(s => s.SolicitacaoViatura)
            .HasForeignKey(sv => sv.SolicitacaoId);

        builder.Entity<SolicitacaoViatura>()
            .HasOne(sv => sv.Viatura)
            .WithMany(v => v.SolicitacaoViatura)
            .HasForeignKey(sv => sv.ViaturaId);

        // Configure Solicitacao
        builder.Entity<Solicitacao>()
            .HasOne(s => s.User)
            .WithMany(u => u.Solicitacoes)
            .HasForeignKey(s => s.UserId);

        builder.Entity<SolicitacaoHistorico>()
            .HasOne(sh => sh.Solicitacao)
            .WithMany(s => s.Historico)
            .HasForeignKey(sh => sh.SolicitacaoId);

        builder.Entity<SolicitacaoHistorico>()
            .HasOne(sh => sh.User)
            .WithMany()
            .HasForeignKey(sh => sh.UserId);

        // Configure Sensor
        builder.Entity<Sensor>()
            .HasOne(s => s.Viatura)
            .WithMany(v => v.Sensor)
            .HasForeignKey(s => s.ViaturaId);

        builder.Entity<SensorLeitura>()
            .HasOne(sl => sl.Sensor)
            .WithMany(s => s.Leituras)
            .HasForeignKey(sl => sl.SensorId);

        // Seed initial roles
        builder.Entity<IdentityRole>().HasData(
            new IdentityRole { Id = "1", Name = "Admin", NormalizedName = "ADMIN" },
            new IdentityRole { Id = "2", Name = "Firefighter", NormalizedName = "FIREFIGHTER" },
            new IdentityRole { Id = "3", Name = "User", NormalizedName = "USER" }
        );
    }
}
