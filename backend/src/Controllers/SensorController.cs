using FirefightersSP.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FirefightersSP.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class SensorController : ControllerBase
{
    private readonly SensorService _sensorService;
    
    public SensorController(SensorService sensorService)
    {
        _sensorService = sensorService;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? viaturaId = null, [FromQuery] string? tipo = null)
    {
        var sensores = await _sensorService.GetAllSensoresAsync(viaturaId, tipo);
        return Ok(sensores);
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var sensor = await _sensorService.GetSensorByIdAsync(id);
        
        if (sensor == null)
        {
            return NotFound();
        }
        
        return Ok(sensor);
    }
    
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateSensorDto dto)
    {
        var sensor = await _sensorService.CreateSensorAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = sensor.Id }, sensor);
    }
    
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSensorDto dto)
    {
        var sensor = await _sensorService.UpdateSensorAsync(id, dto);
        
        if (sensor == null)
        {
            return NotFound();
        }
        
        return Ok(sensor);
    }
    
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _sensorService.DeleteSensorAsync(id);
        
        if (!result)
        {
            return NotFound();
        }
        
        return NoContent();
    }
    
    [HttpGet("leituras/{sensorId}")]
    public async Task<IActionResult> GetLeituras(int sensorId, [FromQuery] DateTime? dataInicio = null, [FromQuery] DateTime? dataFim = null)
    {
        var leituras = await _sensorService.GetSensorLeiturasAsync(sensorId, dataInicio, dataFim);
        return Ok(leituras);
    }
    
    [HttpPost("leituras")]
    [Authorize(Roles = "Admin,Firefighter")]
    public async Task<IActionResult> CreateLeitura([FromBody] CreateSensorLeituraDto dto)
    {
        var leitura = await _sensorService.CreateSensorLeituraAsync(dto);
        return CreatedAtAction(nameof(GetLeituras), new { sensorId = leitura.SensorId }, leitura);
    }
    
    [HttpGet("latest")]
    public async Task<IActionResult> GetLatestLeituras()
    {
        var leituras = await _sensorService.GetLatestSensorLeiturasAsync();
        return Ok(leituras);
    }
    
    [HttpPost("simulate/{viaturaId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SimulateSensorData(int viaturaId, [FromBody] SimulateSensorDataDto dto)
    {
        var result = await _sensorService.SimulateSensorDataAsync(viaturaId, dto.Latitude, dto.Longitude);
        
        if (!result)
        {
            return NotFound();
        }
        
        return Ok(new { message = "Sensor data simulated successfully" });
    }
    
    [HttpGet("viatura/{viaturaId}/gps")]
    public async Task<IActionResult> GetViaturaGPS(int viaturaId)
    {
        var leituras = await _sensorService.GetLatestSensorLeiturasAsync();
        var gpsLeitura = leituras.FirstOrDefault(l => 
            l.ViaturaId == viaturaId && l.SensorTipo == "GPS");
        
        if (gpsLeitura == null)
        {
            return NotFound();
        }
        
        return Ok(new
        {
            viaturaId = gpsLeitura.ViaturaId,
            viaturaIdentificacao = gpsLeitura.ViaturaIdentificacao,
            latitude = gpsLeitura.Latitude,
            longitude = gpsLeitura.Longitude,
            dataLeitura = gpsLeitura.DataLeitura
        });
    }
}

public class SimulateSensorDataDto
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}
