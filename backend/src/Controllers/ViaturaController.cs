using FirefightersSP.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FirefightersSP.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ViaturaController : ControllerBase
{
    private readonly ViaturaService _viaturaService;
    
    public ViaturaController(ViaturaService viaturaService)
    {
        _viaturaService = viaturaService;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? quartel = null,
        [FromQuery] string? status = null,
        [FromQuery] string? tipo = null)
    {
        var viaturas = await _viaturaService.GetAllViaturaAsync(quartel, status, tipo);
        return Ok(viaturas);
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var viatura = await _viaturaService.GetViaturaByIdAsync(id);
        
        if (viatura == null)
        {
            return NotFound();
        }
        
        return Ok(viatura);
    }
    
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateViaturaDto dto)
    {
        var viatura = await _viaturaService.CreateViaturaAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = viatura.Id }, viatura);
    }
    
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateViaturaDto dto)
    {
        var viatura = await _viaturaService.UpdateViaturaAsync(id, dto);
        
        if (viatura == null)
        {
            return NotFound();
        }
        
        return Ok(viatura);
    }
    
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _viaturaService.DeleteViaturaAsync(id);
        
        if (!result)
        {
            return NotFound();
        }
        
        return NoContent();
    }
    
    [HttpGet("disponiveis")]
    public async Task<IActionResult> GetDisponiveis([FromQuery] string? quartel = null)
    {
        var viaturas = await _viaturaService.GetViaturaDisponiveisAsync(quartel);
        return Ok(viaturas);
    }
    
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,Firefighter")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateViaturaStatusDto dto)
    {
        var result = await _viaturaService.UpdateViaturaStatusAsync(id, dto.Status);
        
        if (!result)
        {
            return NotFound();
        }
        
        return Ok(new { message = "Status updated successfully" });
    }
    
    [HttpPut("{id}/localizacao")]
    [Authorize(Roles = "Admin,Firefighter")]
    public async Task<IActionResult> UpdateLocalizacao(int id, [FromBody] UpdateViaturaLocalizacaoDto dto)
    {
        var result = await _viaturaService.UpdateViaturaLocalizacaoAsync(id, dto.Latitude, dto.Longitude);
        
        if (!result)
        {
            return NotFound();
        }
        
        return Ok(new { message = "Localização updated successfully" });
    }
    
    [HttpGet("mapa")]
    public async Task<IActionResult> GetViaturaParaMapa()
    {
        var viaturas = await _viaturaService.GetAllViaturaAsync();
        
        var viaturasMapa = viaturas
            .Where(v => v.Latitude.HasValue && v.Longitude.HasValue)
            .Select(v => new ViaturaMapaDto
            {
                Id = v.Id,
                Identificacao = v.Identificacao,
                Tipo = v.Tipo,
                Status = v.Status,
                Latitude = v.Latitude.Value,
                Longitude = v.Longitude.Value,
                Quartel = v.QuartelBase,
                Placa = v.Placa
            })
            .ToList();
        
        return Ok(viaturasMapa);
    }
}

public class UpdateViaturaStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class UpdateViaturaLocalizacaoDto
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

public class ViaturaMapaDto
{
    public int Id { get; set; }
    public string Identificacao { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? Quartel { get; set; }
    public string? Placa { get; set; }
}
