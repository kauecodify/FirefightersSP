using FirefightersSP.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FirefightersSP.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PlantaoController : ControllerBase
{
    private readonly PlantaoService _plantaoService;
    
    public PlantaoController(PlantaoService plantaoService)
    {
        _plantaoService = plantaoService;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? quartel = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? data = null)
    {
        var plantoes = await _plantaoService.GetAllPlantaoAsync(quartel, status, data);
        return Ok(plantoes);
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var plantao = await _plantaoService.GetPlantaoByIdAsync(id);
        
        if (plantao == null)
        {
            return NotFound();
        }
        
        return Ok(plantao);
    }
    
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePlantaoDto dto)
    {
        var plantao = await _plantaoService.CreatePlantaoAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = plantao.Id }, plantao);
    }
    
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePlantaoDto dto)
    {
        var plantao = await _plantaoService.UpdatePlantaoAsync(id, dto);
        
        if (plantao == null)
        {
            return NotFound();
        }
        
        return Ok(plantao);
    }
    
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _plantaoService.DeletePlantaoAsync(id);
        
        if (!result)
        {
            return NotFound();
        }
        
        return NoContent();
    }
    
    [HttpPost("{plantaoId}/viatura/{viaturaId}")]
    [Authorize(Roles = "Admin,Firefighter")]
    public async Task<IActionResult> AddViatura(int plantaoId, int viaturaId)
    {
        var userId = User.FindFirstValue("userId") ?? "";
        var result = await _plantaoService.AddViaturaToPlantaoAsync(plantaoId, viaturaId, userId);
        
        if (!result)
        {
            return BadRequest(new { message = "Failed to add viatura to plantão" });
        }
        
        return Ok(new { message = "Viatura added to plantão successfully" });
    }
    
    [HttpDelete("{plantaoId}/viatura/{viaturaId}")]
    [Authorize(Roles = "Admin,Firefighter")]
    public async Task<IActionResult> RemoveViatura(int plantaoId, int viaturaId)
    {
        var result = await _plantaoService.RemoveViaturaFromPlantaoAsync(plantaoId, viaturaId);
        
        if (!result)
        {
            return BadRequest(new { message = "Failed to remove viatura from plantão" });
        }
        
        return Ok(new { message = "Viatura removed from plantão successfully" });
    }
    
    [HttpPost("{plantaoId}/bombeiro/{userId}")]
    [Authorize(Roles = "Admin,Firefighter")]
    public async Task<IActionResult> AddBombeiro(int plantaoId, string userId, [FromBody] AddBombeiroDto dto)
    {
        var result = await _plantaoService.AddBombeiroToPlantaoAsync(plantaoId, userId, dto.Funcao);
        
        if (!result)
        {
            return BadRequest(new { message = "Failed to add bombeiro to plantão" });
        }
        
        return Ok(new { message = "Bombeiro added to plantão successfully" });
    }
    
    [HttpDelete("{plantaoId}/bombeiro/{userId}")]
    [Authorize(Roles = "Admin,Firefighter")]
    public async Task<IActionResult> RemoveBombeiro(int plantaoId, string userId)
    {
        var result = await _plantaoService.RemoveBombeiroFromPlantaoAsync(plantaoId, userId);
        
        if (!result)
        {
            return BadRequest(new { message = "Failed to remove bombeiro from plantão" });
        }
        
        return Ok(new { message = "Bombeiro removed from plantão successfully" });
    }
    
    [HttpGet("ativos")]
    public async Task<IActionResult> GetPlantoesAtivos()
    {
        var plantoes = await _plantaoService.GetPlantoesAtivosAsync();
        return Ok(plantoes);
    }
    
    [HttpGet("meus")]
    public async Task<IActionResult> GetMeusPlantoes()
    {
        var userId = User.FindFirstValue("userId") ?? "";
        var plantoes = await _plantaoService.GetMeusPlantoesAsync(userId);
        return Ok(plantoes);
    }
}

public class AddBombeiroDto
{
    public string Funcao { get; set; } = string.Empty;
}
