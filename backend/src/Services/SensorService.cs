using FirefightersSP.Backend.Data;
using FirefightersSP.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace FirefightersSP.Backend.Services;

public class SensorService
{
    private readonly ApplicationDbContext _context;
    
    public SensorService(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<SensorDto>> GetAllSensoresAsync(int? viaturaId = null, string? tipo = null)
    {
        var query = _context.Sensor.AsQueryable();
        
        if (viaturaId.HasValue)
        {
            query = query.Where(s => s.ViaturaId == viaturaId.Value);
        }
        
        if (!string.IsNullOrEmpty(tipo))
        {
            query = query.Where(s => s.Tipo == tipo);
        }
        
        var sensores = await query
            .Include(s => s.Viatura)
            .OrderBy(s => s.Identificacao)
            .ToListAsync();
        
        return sensores.Select(MapToDto).ToList();
    }
    
    public async Task<SensorDto?> GetSensorByIdAsync(int id)
    {
        var sensor = await _context.Sensor
            .Include(s => s.Viatura)
            .FirstOrDefaultAsync(s => s.Id == id);
        
        return sensor != null ? MapToDto(sensor) : null;
    }
    
    public async Task<SensorDto> CreateSensorAsync(CreateSensorDto dto)
    {
        var sensor = new Sensor
        {
            Identificacao = dto.Identificacao,
            Tipo = dto.Tipo,
            ViaturaId = dto.ViaturaId,
            Descricao = dto.Descricao,
            Ativo = dto.Ativo
        };
        
        _context.Sensor.Add(sensor);
        await _context.SaveChangesAsync();
        
        return MapToDto(sensor);
    }
    
    public async Task<SensorDto?> UpdateSensorAsync(int id, UpdateSensorDto dto)
    {
        var sensor = await _context.Sensor.FindAsync(id);
        if (sensor == null) return null;
        
        sensor.Identificacao = dto.Identificacao;
        sensor.Tipo = dto.Tipo;
        sensor.ViaturaId = dto.ViaturaId;
        sensor.Descricao = dto.Descricao;
        sensor.Ativo = dto.Ativo;
        
        await _context.SaveChangesAsync();
        
        return MapToDto(sensor);
    }
    
    public async Task<bool> DeleteSensorAsync(int id)
    {
        var sensor = await _context.Sensor.FindAsync(id);
        if (sensor == null) return false;
        
        _context.Sensor.Remove(sensor);
        await _context.SaveChangesAsync();
        
        return true;
    }
    
    public async Task<SensorLeituraDto> CreateSensorLeituraAsync(CreateSensorLeituraDto dto)
    {
        var leitura = new SensorLeitura
        {
            SensorId = dto.SensorId,
            Valor = dto.Valor,
            Unidade = dto.Unidade,
            DataLeitura = dto.DataLeitura,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Alertado = dto.Alertado
        };
        
        _context.SensorLeitura.Add(leitura);
        await _context.SaveChangesAsync();
        
        // Update sensor last reading date
        var sensor = await _context.Sensor.FindAsync(dto.SensorId);
        if (sensor != null)
        {
            sensor.DataUltimaLeitura = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        
        return new SensorLeituraDto
        {
            Id = leitura.Id,
            SensorId = leitura.SensorId,
            Valor = leitura.Valor,
            Unidade = leitura.Unidade,
            DataLeitura = leitura.DataLeitura,
            Latitude = leitura.Latitude,
            Longitude = leitura.Longitude,
            Alertado = leitura.Alertado
        };
    }
    
    public async Task<List<SensorLeituraDto>> GetSensorLeiturasAsync(int sensorId, DateTime? dataInicio = null, DateTime? dataFim = null)
    {
        var query = _context.SensorLeitura
            .Where(sl => sl.SensorId == sensorId)
            .OrderByDescending(sl => sl.DataLeitura);
        
        if (dataInicio.HasValue)
        {
            query = query.Where(sl => sl.DataLeitura >= dataInicio.Value);
        }
        
        if (dataFim.HasValue)
        {
            query = query.Where(sl => sl.DataLeitura <= dataFim.Value);
        }
        
        var leituras = await query.ToListAsync();
        
        return leituras.Select(l => new SensorLeituraDto
        {
            Id = l.Id,
            SensorId = l.SensorId,
            Valor = l.Valor,
            Unidade = l.Unidade,
            DataLeitura = l.DataLeitura,
            Latitude = l.Latitude,
            Longitude = l.Longitude,
            Alertado = l.Alertado
        }).ToList();
    }
    
    public async Task<List<SensorLeituraDto>> GetLatestSensorLeiturasAsync()
    {
        // Get latest reading from each sensor
        var latestReadings = await _context.SensorLeitura
            .GroupBy(sl => sl.SensorId)
            .Select(g => g.OrderByDescending(sl => sl.DataLeitura).FirstOrDefault())
            .Where(sl => sl != null)
            .Include(sl => sl.Sensor)
                .ThenInclude(s => s.Viatura)
            .ToListAsync();
        
        return latestReadings.Select(l => new SensorLeituraDto
        {
            Id = l.Id,
            SensorId = l.SensorId,
            Valor = l.Valor,
            Unidade = l.Unidade,
            DataLeitura = l.DataLeitura,
            Latitude = l.Latitude,
            Longitude = l.Longitude,
            Alertado = l.Alertado,
            SensorIdentificacao = l.Sensor?.Identificacao,
            SensorTipo = l.Sensor?.Tipo,
            ViaturaId = l.Sensor?.ViaturaId,
            ViaturaIdentificacao = l.Sensor?.Viatura?.Identificacao
        }).ToList();
    }
    
    public async Task<bool> SimulateSensorDataAsync(int viaturaId, double latitude, double longitude)
    {
        var viatura = await _context.Viatura.FindAsync(viaturaId);
        if (viatura == null) return false;
        
        // Update viatura location
        viatura.Latitude = latitude;
        viatura.Longitude = longitude;
        viatura.LocalizacaoAtual = $"{latitude}, {longitude}";
        viatura.UltimaAtualizacaoSensor = DateTime.UtcNow;
        
        // Simulate GPS reading
        var gpsSensor = await _context.Sensor
            .FirstOrDefaultAsync(s => s.ViaturaId == viaturaId && s.Tipo == "GPS");
        
        if (gpsSensor != null)
        {
            await _context.SensorLeitura.AddAsync(new SensorLeitura
            {
                SensorId = gpsSensor.Id,
                Valor = $"{latitude},{longitude}",
                DataLeitura = DateTime.UtcNow,
                Latitude = latitude,
                Longitude = longitude,
                Alertado = false
            });
        }
        
        // Simulate Fuel reading (random value)
        var fuelSensor = await _context.Sensor
            .FirstOrDefaultAsync(s => s.ViaturaId == viaturaId && s.Tipo == "Combustível");
        
        if (fuelSensor != null)
        {
            var random = new Random();
            var fuelLevel = random.Next(0, 100);
            
            await _context.SensorLeitura.AddAsync(new SensorLeitura
            {
                SensorId = fuelSensor.Id,
                Valor = fuelLevel.ToString(),
                Unidade = "%",
                DataLeitura = DateTime.UtcNow,
                Alertado = fuelLevel < 20 // Alert if fuel is low
            });
            
            // Update viatura fuel level
            viatura.NivelCombustivel = fuelLevel;
        }
        
        await _context.SaveChangesAsync();
        
        return true;
    }
    
    private SensorDto MapToDto(Sensor sensor)
    {
        return new SensorDto
        {
            Id = sensor.Id,
            Identificacao = sensor.Identificacao,
            Tipo = sensor.Tipo,
            ViaturaId = sensor.ViaturaId,
            ViaturaIdentificacao = sensor.Viatura?.Identificacao,
            Descricao = sensor.Descricao,
            Ativo = sensor.Ativo,
            DataInstalacao = sensor.DataInstalacao,
            DataUltimaLeitura = sensor.DataUltimaLeitura
        };
    }
}

public class SensorDto
{
    public int Id { get; set; }
    public string Identificacao { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public int ViaturaId { get; set; }
    public string? ViaturaIdentificacao { get; set; }
    public string? Descricao { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataInstalacao { get; set; }
    public DateTime? DataUltimaLeitura { get; set; }
}

public class CreateSensorDto
{
    public string Identificacao { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public int ViaturaId { get; set; }
    public string? Descricao { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UpdateSensorDto
{
    public string Identificacao { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public int ViaturaId { get; set; }
    public string? Descricao { get; set; }
    public bool Ativo { get; set; } = true;
}

public class SensorLeituraDto
{
    public int Id { get; set; }
    public int SensorId { get; set; }
    public string? SensorIdentificacao { get; set; }
    public string? SensorTipo { get; set; }
    public int? ViaturaId { get; set; }
    public string? ViaturaIdentificacao { get; set; }
    public string Valor { get; set; } = string.Empty;
    public string? Unidade { get; set; }
    public DateTime DataLeitura { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool Alertado { get; set; }
}

public class CreateSensorLeituraDto
{
    public int SensorId { get; set; }
    public string Valor { get; set; } = string.Empty;
    public string? Unidade { get; set; }
    public DateTime DataLeitura { get; set; } = DateTime.UtcNow;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool Alertado { get; set; } = false;
}
