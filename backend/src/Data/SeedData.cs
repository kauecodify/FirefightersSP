using FirefightersSP.Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FirefightersSP.Backend.Data;

public static class SeedData
{
    public static async Task Initialize(ApplicationDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
    {
        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Check if roles already exist
        var roles = new[] { "Admin", "Firefighter", "User" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Seed Admin User
        var adminEmail = "admin@firefighterssp.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new User
            {
                UserName = adminEmail,
                Email = adminEmail,
                NomeCompleto = "Administrador do Sistema",
                Cargo = "Admin",
                Ativo = true,
                EmailConfirmed = true
            };
            
            var result = await userManager.CreateAsync(adminUser, "Admin@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        // Seed Firefighter User
        var firefighterEmail = "bombeiro@firefighterssp.com";
        var firefighterUser = await userManager.FindByEmailAsync(firefighterEmail);
        if (firefighterUser == null)
        {
            firefighterUser = new User
            {
                UserName = firefighterEmail,
                Email = firefighterEmail,
                NomeCompleto = "Bombeiro Teste",
                Cargo = "Bombeiro",
                Matricula = "BM-001",
                Quartel = "Quartel Central",
                Ativo = true,
                EmailConfirmed = true
            };
            
            var result = await userManager.CreateAsync(firefighterUser, "Bombeiro@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(firefighterUser, "Firefighter");
            }
        }

        // Seed regular User
        var userEmail = "usuario@firefighterssp.com";
        var regularUser = await userManager.FindByEmailAsync(userEmail);
        if (regularUser == null)
        {
            regularUser = new User
            {
                UserName = userEmail,
                Email = userEmail,
                NomeCompleto = "Usuário Teste",
                Cargo = "Cidadão",
                Ativo = true,
                EmailConfirmed = true
            };
            
            var result = await userManager.CreateAsync(regularUser, "Usuario@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(regularUser, "User");
            }
        }

        // Seed Viatura
        if (!await context.Viatura.AnyAsync())
        {
            var viaturas = new List<Viatura>
            {
                new Viatura
                {
                    Identificacao = "AB-001",
                    Tipo = "Auto Bomba",
                    Modelo = "Scania P360",
                    Placa = "ABC1234",
                    Descricao = "Auto Bomba principal do Quartel Central",
                    Status = "Disponível",
                    QuartelBase = "Quartel Central",
                    Capacidade = 5,
                    Ativa = true
                },
                new Viatura
                {
                    Identificacao = "AM-001",
                    Tipo = "Ambulância",
                    Modelo = "Mercedes Sprinter",
                    Placa = "AMB001",
                    Descricao = "Ambulância de suporte avançado",
                    Status = "Disponível",
                    QuartelBase = "Quartel Central",
                    Capacidade = 4,
                    Ativa = true
                },
                new Viatura
                {
                    Identificacao = "RS-001",
                    Tipo = "Resgate",
                    Modelo = "Ford Ranger",
                    Placa = "RES001",
                    Descricao = "Viatura de resgate em acidentes",
                    Status = "Em Manutenção",
                    QuartelBase = "Quartel Norte",
                    Capacidade = 3,
                    Ativa = true
                },
                new Viatura
                {
                    Identificacao = "AB-002",
                    Tipo = "Auto Bomba",
                    Modelo = "Volvo FL",
                    Placa = "ABC5678",
                    Descricao = "Auto Bomba secundária",
                    Status = "Disponível",
                    QuartelBase = "Quartel Sul",
                    Capacidade = 6,
                    Ativa = true
                }
            };
            
            await context.Viatura.AddRangeAsync(viaturas);
            await context.SaveChangesAsync();
        }

        // Seed Plantão
        if (!await context.Plantao.AnyAsync())
        {
            var plantao = new Plantao
            {
                Nome = "Plantão Diurno - Quartel Central",
                Descricao = "Plantão das 08:00 às 18:00",
                DataInicio = DateTime.UtcNow.Date.AddHours(8),
                DataFim = DateTime.UtcNow.Date.AddHours(18),
                Status = "Ativo",
                Quartel = "Quartel Central",
                MaxViatura = 10,
                MaxBombeiros = 20
            };
            
            await context.Plantao.AddAsync(plantao);
            await context.SaveChangesAsync();

            // Add viaturas to plantão
            var viaturas = await context.Viatura.Where(v => v.QuartelBase == "Quartel Central").ToListAsync();
            foreach (var viatura in viaturas)
            {
                await context.PlantaoViatura.AddAsync(new PlantaoViatura
                {
                    PlantaoId = plantao.Id,
                    ViaturaId = viatura.Id,
                    Status = "Alocada"
                });
            }
            
            // Add bombeiro to plantão
            var bombeiro = await userManager.FindByEmailAsync(firefighterEmail);
            if (bombeiro != null)
            {
                await context.PlantaoBombeiro.AddAsync(new PlantaoBombeiro
                {
                    PlantaoId = plantao.Id,
                    UserId = bombeiro.Id,
                    Funcao = "Bombeiro",
                    Status = "Presente"
                });
            }
            
            await context.SaveChangesAsync();
        }

        // Seed Solicitação
        if (!await context.Solicitacao.AnyAsync())
        {
            var solicitacoes = new List<Solicitacao>
            {
                new Solicitacao
                {
                    Protocolo = "2026-0001",
                    Tipo = "Incêndio",
                    Titulo = "Incêndio em prédio residencial",
                    Descricao = "Incêndio de grandes proporções no 3° andar",
                    Status = "Finalizada",
                    Prioridade = "Emergência",
                    Endereco = "Rua das Flores, 123",
                    Bairro = "Centro",
                    Cidade = "São Paulo",
                    CEP = "01234-567",
                    Latitude = -23.5505,
                    Longitude = -46.6333,
                    NomeSolicitante = "João Silva",
                    TelefoneSolicitante = "11987654321",
                    DataAbertura = DateTime.UtcNow.AddHours(-2),
                    DataInicioAtendimento = DateTime.UtcNow.AddHours(-1.5),
                    DataFimAtendimento = DateTime.UtcNow.AddHours(-0.5),
                    Observacoes = "Atendimento concluído com sucesso"
                },
                new Solicitacao
                {
                    Protocolo = "2026-0002",
                    Tipo = "Resgate",
                    Titulo = "Resgate de animal em árvore",
                    Descricao = "Cachorro preso em árvore",
                    Status = "Em Atendimento",
                    Prioridade = "Normal",
                    Endereco = "Av. Paulista, 456",
                    Bairro = "Bela Vista",
                    Cidade = "São Paulo",
                    CEP = "01301-000",
                    Latitude = -23.5614,
                    Longitude = -46.6558,
                    NomeSolicitante = "Maria Santos",
                    TelefoneSolicitante = "11987654322",
                    DataAbertura = DateTime.UtcNow.AddHours(-1),
                    DataInicioAtendimento = DateTime.UtcNow.AddMinutes(-30),
                    Observacoes = "Equipe a caminho"
                },
                new Solicitacao
                {
                    Protocolo = "2026-0003",
                    Tipo = "Socorro Médico",
                    Titulo = "Mal súbito",
                    Descricao = "Pessoa desmaiada na rua",
                    Status = "Aberta",
                    Prioridade = "Alta",
                    Endereco = "Rua Augusta, 789",
                    Bairro = "Consolação",
                    Cidade = "São Paulo",
                    CEP = "01302-000",
                    Latitude = -23.5658,
                    Longitude = -46.6586,
                    NomeSolicitante = "Carlos Pereira",
                    TelefoneSolicitante = "11987654323",
                    DataAbertura = DateTime.UtcNow.AddMinutes(-15),
                    Observacoes = "Aguardando viatura disponível"
                }
            };
            
            await context.Solicitacao.AddRangeAsync(solicitacoes);
            await context.SaveChangesAsync();

            // Add viaturas to solicitações
            var viatura1 = await context.Viatura.FirstOrDefaultAsync(v => v.Identificacao == "AB-001");
            var viatura2 = await context.Viatura.FirstOrDefaultAsync(v => v.Identificacao == "AM-001");
            
            if (viatura1 != null && viatura2 != null)
            {
                var sol1 = await context.Solicitacao.FirstOrDefaultAsync(s => s.Protocolo == "2026-0001");
                var sol2 = await context.Solicitacao.FirstOrDefaultAsync(s => s.Protocolo == "2026-0002");
                
                if (sol1 != null)
                {
                    await context.SolicitacaoViatura.AddAsync(new SolicitacaoViatura
                    {
                        SolicitacaoId = sol1.Id,
                        ViaturaId = viatura1.Id,
                        Status = "Finalizada",
                        DataChegada = sol1.DataInicioAtendimento?.AddMinutes(10),
                        DataSaida = sol1.DataFimAtendimento
                    });
                }
                
                if (sol2 != null)
                {
                    await context.SolicitacaoViatura.AddAsync(new SolicitacaoViatura
                    {
                        SolicitacaoId = sol2.Id,
                        ViaturaId = viatura2.Id,
                        Status = "A Caminho",
                        DataChegada = DateTime.UtcNow
                    });
                }
            }
            
            await context.SaveChangesAsync();
        }

        // Seed Sensores
        if (!await context.Sensor.AnyAsync())
        {
            var viaturas = await context.Viatura.ToListAsync();
            foreach (var viatura in viaturas)
            {
                var sensores = new List<Sensor>
                {
                    new Sensor
                    {
                        Identificacao = $"GPS-{viatura.Identificacao}",
                        Tipo = "GPS",
                        ViaturaId = viatura.Id,
                        Descricao = "Sensor de localização GPS",
                        Ativo = true
                    },
                    new Sensor
                    {
                        Identificacao = $"FUEL-{viatura.Identificacao}",
                        Tipo = "Combustível",
                        ViaturaId = viatura.Id,
                        Descricao = "Sensor de nível de combustível",
                        Ativo = true
                    }
                };
                
                await context.Sensor.AddRangeAsync(sensores);
            }
            
            await context.SaveChangesAsync();

            // Seed some readings
            var sensors = await context.Sensor.ToListAsync();
            foreach (var sensor in sensors)
            {
                for (int i = 0; i < 5; i++)
                {
                    var leitura = new SensorLeitura
                    {
                        SensorId = sensor.Id,
                        Valor = sensor.Tipo == "GPS" 
                            ? $"{viatura.Latitude ?? -23.5505 + (i * 0.001)},{viatura.Longitude ?? -46.6333 + (i * 0.001)}"
                            : (sensor.Tipo == "Combustível" ? (80 - (i * 5)).ToString() : "0"),
                        Unidade = sensor.Tipo == "Combustível" ? "%" : null,
                        DataLeitura = DateTime.UtcNow.AddMinutes(-(5 - i)),
                        Alertado = false
                    };
                    
                    if (sensor.Tipo == "GPS" && viatura != null)
                    {
                        leitura.Latitude = viatura.Latitude ?? -23.5505 + (i * 0.001);
                        leitura.Longitude = viatura.Longitude ?? -46.6333 + (i * 0.001);
                    }
                    
                    await context.SensorLeitura.AddAsync(leitura);
                }
            }
            
            await context.SaveChangesAsync();
        }
    }
}
