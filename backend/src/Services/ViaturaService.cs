using FirefightersSP.Backend.Data;
using FirefightersSP.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace FirefightersSP.Backend.Services;

public class ViaturaService
{
    private readonly ApplicationDbContext _context;
    
    public ViaturaService(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<ViaturaDto>> GetAllViaturaAsync(string? quartel = null, string? status = null, string? tipo = null)
    {
        var query = _context.Viatura.AsQueryable();
        
        if (!string.IsNullOrEmpty(quartel))
        {
            query = query.Where(v => v.QuartelBase == quartel);
        }
        
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(v => v.Status == status);
        }
        
        if (!string.IsNullOrEmpty(tipo))
        {
            query = query.Where(v => v.Tipo == tipo);
        }
        
        var viaturas = await query.OrderBy(v => v.Identificacao).ToListAsync();
        return viaturas.Select(MapToDto).ToList();
    }
    
    public async Task<ViaturaDto?> GetViaturaByIdAsync(int id)
    {
        var viatura = await _context.Viatura.FindAsync(id);
        return viatura != null ? MapToDto(viatura) : null;
    }
    
    public async Task<ViaturaDto> CreateViaturaAsync(CreateViaturaDto dto)
    {
        var viatura = new Viatura
        {
            Identificacao = dto.Identificacao,
            Tipo = dto.Tipo,
            Modelo = dto.Modelo,
            Placa = dto.Placa,
            Descricao = dto.Descricao,
            Status = dto.Status,
            QuartelBase = dto.QuartelBase,
            Capacidade = dto.Capacidade,
            Ativa = dto.Ativa,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude
        };
        
        _context.Viatura.Add(viatura);
        await _context.SaveChangesAsync();
        
        return MapToDto(viatura);
    }
    
    public async Task<ViaturaDto?> UpdateViaturaAsync(int id, UpdateViaturaDto dto)
    {
        var viatura = await _context.Viatura.FindAsync(id);
        if (viatura == null) return null;
        
        viatura.Identificacao = dto.Identificacao;
        viatura.Tipo = dto.Tipo;
        viatura.Modelo = dto.Modelo;
        viatura.Placa = dto.Placa;
        viatura.Descricao = dto.Descricao;
        viatura.Status = dto.Status;
        viatura.QuartelBase = dto.QuartelBase;
        viatura.Capacidade = dto.Capacidade;
        viatura.Ativa = dto.Ativa;
        viatura.Latitude = dto.Latitude;
        viatura.Longitude = dto.Longitude;
        
        await _context.SaveChangesAsync();
        
        return MapToDto(viatura);
    }
    
    public async Task<bool> DeleteViaturaAsync(int id)
    {
        var viatura = await _context.Viatura.FindAsync(id);
        if (viatura == null) return false;
        
        _context.Viatura.Remove(viatura);
        await _context.SaveChangesAsync();
        
        return true;
    }
    
    public async Task<List<ViaturaDto>> GetViaturaDisponiveisAsync(string? quartel = null)
    {
        var query = _context.Viatura
            .Where(v => v.Status == "Disponível" && v.Ativa);
        
        if (!string.IsNullOrEmpty(quartel))
        {
            query = query.Where(v => v.QuartelBase == quartel);
        }
        
        var viaturas = await query.OrderBy(v => v.Identificacao).ToListAsync();
        return viaturas.Select(MapToDto).ToList();
    }
    
    public async Task<bool> UpdateViaturaLocalizacaoAsync(int id, double latitude, double longitude)
    {
        var viatura = await _context.Viatura.FindAsync(id);
        if (viatura == null) return false;
        
        viatura.Latitude = latitude;
        viatura.Longitude = longitude;
        viatura.LocalizacaoAtual = $"{latitude}, {longitude}";
        viatura.UltimaAtualizacaoSensor = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        
        return true;
    }
    
    public async Task<bool> UpdateViaturaStatusAsync(int id, string status)
    {
        var viatura = await _context.Viatura.FindAsync(id);
        if (viatura == null) return false;
        
        viatura.Status = status;
        await _context.SaveChangesAsync();
        
        return true;
    }
    
    private ViaturaDto MapToDto(Viatura viatura)
    {
        return new ViaturaDto
        {
            Id = viatura.Id,
            Identificacao = viatura.Identificacao,
            Tipo = viatura.Tipo,
            Modelo = viatura.Modelo,
            Placa = viatura.Placa,
            Descricao = viatura.Descricao,
            Status = viatura.Status,
            QuartelBase = viatura.QuartelBase,
            Capacidade = viatura.Capacidade,
            Ativa = viatura.Ativa,
            Latitude = viatura.Latitude,
            Longitude = viatura.Longitude,
            LocalizacaoAtual = viatura.LocalizacaoAtual,
            DataCadastro = viatura.DataCadastro,
            DataUltimaManutencao = viatura.DataUltimaManutencao,
            NivelCombustivel = viatura.NivelCombustivel,
            Velocidade = viatura.Velocidade,
            UltimaAtualizacaoSensor = viatura.UltimaAtualizacaoSensor
        };
    }
}

public class ViaturaDto
{
    public int Id { get; set; }
    public string Identificacao { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string Placa { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? QuartelBase { get; set; }
    public int Capacidade { get; set; }
    public bool Ativa { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? LocalizacaoAtual { get; set; }
    public DateTime DataCadastro { get; set; }
    public DateTime? DataUltimaManutencao { get; set; }
    public double? NivelCombustivel { get; set; }
    public double? Velocidade { get; set; }
    public DateTime? UltimaAtualizacaoSensor { get; set; }
}

public class CreateViaturaDto
{
    public string Identificacao { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string Placa { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Status { get; set; } = "Disponível";
    public string? QuartelBase { get; set; }
    public int Capacidade { get; set; } = 1;
    public bool Ativa { get; set; } = true;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}

public class UpdateViaturaDto
{
    public string Identificacao { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string Placa { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? QuartelBase { get; set; }
    public int Capacidade { get; set; } = 1;
    public bool Ativa { get; set; } = true;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
