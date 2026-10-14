using FirefightersSP.Backend.Data;
using FirefightersSP.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace FirefightersSP.Backend.Services;

public class PlantaoService
{
    private readonly ApplicationDbContext _context;
    
    public PlantaoService(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<PlantaoDto>> GetAllPlantaoAsync(string? quartel = null, string? status = null, DateTime? data = null)
    {
        var query = _context.Plantao.AsQueryable();
        
        if (!string.IsNullOrEmpty(quartel))
        {
            query = query.Where(p => p.Quartel == quartel);
        }
        
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(p => p.Status == status);
        }
        
        if (data.HasValue)
        {
            query = query.Where(p => p.DataInicio.Date == data.Value.Date);
        }
        
        var plantoes = await query
            .OrderBy(p => p.DataInicio)
            .Include(p => p.PlantaoViatura)
                .ThenInclude(pv => pv.Viatura)
            .Include(p => p.PlantaoBombeiro)
                .ThenInclude(pb => pb.User)
            .ToListAsync();
        
        return plantoes.Select(MapToDto).ToList();
    }
    
    public async Task<PlantaoDto?> GetPlantaoByIdAsync(int id)
    {
        var plantao = await _context.Plantao
            .Include(p => p.PlantaoViatura)
                .ThenInclude(pv => pv.Viatura)
            .Include(p => p.PlantaoBombeiro)
                .ThenInclude(pb => pb.User)
            .FirstOrDefaultAsync(p => p.Id == id);
        
        return plantao != null ? MapToDto(plantao) : null;
    }
    
    public async Task<PlantaoDto> CreatePlantaoAsync(CreatePlantaoDto dto)
    {
        var plantao = new Plantao
        {
            Nome = dto.Nome,
            Descricao = dto.Descricao,
            DataInicio = dto.DataInicio,
            DataFim = dto.DataFim,
            Status = dto.Status,
            Quartel = dto.Quartel,
            MaxViatura = dto.MaxViatura,
            MaxBombeiros = dto.MaxBombeiros
        };
        
        _context.Plantao.Add(plantao);
        await _context.SaveChangesAsync();
        
        return MapToDto(plantao);
    }
    
    public async Task<PlantaoDto?> UpdatePlantaoAsync(int id, UpdatePlantaoDto dto)
    {
        var plantao = await _context.Plantao.FindAsync(id);
        if (plantao == null) return null;
        
        plantao.Nome = dto.Nome;
        plantao.Descricao = dto.Descricao;
        plantao.DataInicio = dto.DataInicio;
        plantao.DataFim = dto.DataFim;
        plantao.Status = dto.Status;
        plantao.Quartel = dto.Quartel;
        plantao.MaxViatura = dto.MaxViatura;
        plantao.MaxBombeiros = dto.MaxBombeiros;
        
        await _context.SaveChangesAsync();
        
        return MapToDto(plantao);
    }
    
    public async Task<bool> DeletePlantaoAsync(int id)
    {
        var plantao = await _context.Plantao.FindAsync(id);
        if (plantao == null) return false;
        
        _context.Plantao.Remove(plantao);
        await _context.SaveChangesAsync();
        
        return true;
    }
    
    public async Task<bool> AddViaturaToPlantaoAsync(int plantaoId, int viaturaId, string userId)
    {
        var plantao = await _context.Plantao.FindAsync(plantaoId);
        var viatura = await _context.Viatura.FindAsync(viaturaId);
        
        if (plantao == null || viatura == null) return false;
        
        // Check if already assigned
        var existing = await _context.PlantaoViatura
            .FirstOrDefaultAsync(pv => pv.PlantaoId == plantaoId && pv.ViaturaId == viaturaId);
        
        if (existing != null) return false;
        
        // Check max viaturas
        var count = await _context.PlantaoViatura
            .CountAsync(pv => pv.PlantaoId == plantaoId);
        
        if (count >= plantao.MaxViatura) return false;
        
        _context.PlantaoViatura.Add(new PlantaoViatura
        {
            PlantaoId = plantaoId,
            ViaturaId = viaturaId,
            Status = "Alocada"
        });
        
        // Update viatura status
        viatura.Status = "Em Plantão";
        
        await _context.SaveChangesAsync();
        
        return true;
    }
    
    public async Task<bool> RemoveViaturaFromPlantaoAsync(int plantaoId, int viaturaId)
    {
        var assignment = await _context.PlantaoViatura
            .FirstOrDefaultAsync(pv => pv.PlantaoId == plantaoId && pv.ViaturaId == viaturaId);
        
        if (assignment == null) return false;
        
        _context.PlantaoViatura.Remove(assignment);
        
        // Update viatura status
        var viatura = await _context.Viatura.FindAsync(viaturaId);
        if (viatura != null)
        {
            viatura.Status = "Disponível";
        }
        
        await _context.SaveChangesAsync();
        
        return true;
    }
    
    public async Task<bool> AddBombeiroToPlantaoAsync(int plantaoId, string userId, string funcao)
    {
        var plantao = await _context.Plantao.FindAsync(plantaoId);
        var user = await _context.Users.FindAsync(userId);
        
        if (plantao == null || user == null) return false;
        
        // Check if already assigned
        var existing = await _context.PlantaoBombeiro
            .FirstOrDefaultAsync(pb => pb.PlantaoId == plantaoId && pb.UserId == userId);
        
        if (existing != null) return false;
        
        // Check max bombeiros
        var count = await _context.PlantaoBombeiro
            .CountAsync(pb => pb.PlantaoId == plantaoId);
        
        if (count >= plantao.MaxBombeiros) return false;
        
        _context.PlantaoBombeiro.Add(new PlantaoBombeiro
        {
            PlantaoId = plantaoId,
            UserId = userId,
            Funcao = funcao,
            Status = "Presente"
        });
        
        await _context.SaveChangesAsync();
        
        return true;
    }
    
    public async Task<bool> RemoveBombeiroFromPlantaoAsync(int plantaoId, string userId)
    {
        var assignment = await _context.PlantaoBombeiro
            .FirstOrDefaultAsync(pb => pb.PlantaoId == plantaoId && pb.UserId == userId);
        
        if (assignment == null) return false;
        
        _context.PlantaoBombeiro.Remove(assignment);
        await _context.SaveChangesAsync();
        
        return true;
    }
    
    public async Task<List<PlantaoDto>> GetPlantoesAtivosAsync()
    {
        var plantoes = await _context.Plantao
            .Where(p => p.Status == "Ativo")
            .OrderBy(p => p.DataInicio)
            .Include(p => p.PlantaoViatura)
                .ThenInclude(pv => pv.Viatura)
            .Include(p => p.PlantaoBombeiro)
                .ThenInclude(pb => pb.User)
            .ToListAsync();
        
        return plantoes.Select(MapToDto).ToList();
    }
    
    public async Task<List<PlantaoDto>> GetMeusPlantoesAsync(string userId)
    {
        var plantoes = await _context.PlantaoBombeiro
            .Where(pb => pb.UserId == userId)
            .Include(pb => pb.Plantao)
                .ThenInclude(p => p.PlantaoViatura)
                    .ThenInclude(pv => pv.Viatura)
            .Include(pb => pb.Plantao)
                .ThenInclude(p => p.PlantaoBombeiro)
                    .ThenInclude(pb2 => pb2.User)
            .OrderBy(pb => pb.Plantao.DataInicio)
            .Select(pb => pb.Plantao)
            .ToListAsync();
        
        return plantoes.Select(MapToDto).ToList();
    }
    
    private PlantaoDto MapToDto(Plantao plantao)
    {
        return new PlantaoDto
        {
            Id = plantao.Id,
            Nome = plantao.Nome,
            Descricao = plantao.Descricao,
            DataInicio = plantao.DataInicio,
            DataFim = plantao.DataFim,
            Status = plantao.Status,
            Quartel = plantao.Quartel,
            MaxViatura = plantao.MaxViatura,
            MaxBombeiros = plantao.MaxBombeiros,
            ViaturaCount = plantao.PlantaoViatura?.Count ?? 0,
            BombeiroCount = plantao.PlantaoBombeiro?.Count ?? 0,
            Viatura = plantao.PlantaoViatura?.Select(pv => new PlantaoViaturaDto
            {
                ViaturaId = pv.ViaturaId,
                Identificacao = pv.Viatura?.Identificacao ?? "",
                Tipo = pv.Viatura?.Tipo ?? "",
                Status = pv.Status ?? ""
            }).ToList() ?? new List<PlantaoViaturaDto>(),
            Bombeiros = plantao.PlantaoBombeiro?.Select(pb => new PlantaoBombeiroDto
            {
                UserId = pb.UserId,
                Nome = pb.User?.NomeCompleto ?? pb.User?.UserName ?? "",
                Funcao = pb.Funcao ?? "",
                Status = pb.Status ?? ""
            }).ToList() ?? new List<PlantaoBombeiroDto>()
        };
    }
}

public class PlantaoDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Quartel { get; set; }
    public int MaxViatura { get; set; }
    public int MaxBombeiros { get; set; }
    public int ViaturaCount { get; set; }
    public int BombeiroCount { get; set; }
    public List<PlantaoViaturaDto> Viatura { get; set; } = new List<PlantaoViaturaDto>();
    public List<PlantaoBombeiroDto> Bombeiros { get; set; } = new List<PlantaoBombeiroDto>();
}

public class PlantaoViaturaDto
{
    public int ViaturaId { get; set; }
    public string Identificacao { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class PlantaoBombeiroDto
{
    public string UserId { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Funcao { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class CreatePlantaoDto
{
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime DataInicio { get; set; } = DateTime.UtcNow;
    public DateTime DataFim { get; set; }
    public string Status { get; set; } = "Ativo";
    public string? Quartel { get; set; }
    public int MaxViatura { get; set; } = 10;
    public int MaxBombeiros { get; set; } = 20;
}

public class UpdatePlantaoDto
{
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Quartel { get; set; }
    public int MaxViatura { get; set; }
    public int MaxBombeiros { get; set; }
}
