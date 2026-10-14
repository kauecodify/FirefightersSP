using FirefightersSP.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FirefightersSP.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SolicitacaoController : ControllerBase
{
    private readonly SolicitacaoService _solicitacaoService;
    
    public SolicitacaoController(SolicitacaoService solicitacaoService)
    {
        _solicitacaoService = solicitacaoService;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status = null,
        [FromQuery] string? prioridade = null,
        [FromQuery] string? tipo = null,
        [FromQuery] string? quartel = null)
    {
        var solicitacoes = await _solicitacaoService.GetAllSolicitacoesAsync(status, prioridade, tipo, quartel);
        return Ok(solicitacoes);
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var solicitacao = await _solicitacaoService.GetSolicitacaoByIdAsync(id);
        
        if (solicitacao == null)
        {
            return NotFound();
        }
        
        return Ok(solicitacao);
    }
    
    [HttpGet("protocolo/{protocolo}")]
    public async Task<IActionResult> GetByProtocolo(string protocolo)
    {
        var solicitacao = await _solicitacaoService.GetSolicitacaoByProtocoloAsync(protocolo);
        
        if (solicitacao == null)
        {
            return NotFound();
        }
        
        return Ok(solicitacao);
    }
    
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSolicitacaoDto dto)
    {
        var userId = User?.FindFirstValue("userId");
        var solicitacao = await _solicitacaoService.CreateSolicitacaoAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = solicitacao.Id }, solicitacao);
    }
    
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Firefighter")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSolicitacaoDto dto)
    {
        var userId = User.FindFirstValue("userId") ?? "";
        var solicitacao = await _solicitacaoService.UpdateSolicitacaoAsync(id, dto, userId);
        
        if (solicitacao == null)
        {
            return NotFound();
        }
        
        return Ok(solicitacao);
    }
    
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _solicitacaoService.DeleteSolicitacaoAsync(id);
        
        if (!result)
        {
            return NotFound();
        }
        
        return NoContent();
    }
    
    [HttpPost("{solicitacaoId}/viatura/{viaturaId}")]
    [Authorize(Roles = "Admin,Firefighter")]
    public async Task<IActionResult> AssignViatura(int solicitacaoId, int viaturaId)
    {
        var userId = User.FindFirstValue("userId") ?? "";
        var result = await _solicitacaoService.AssignViaturaToSolicitacaoAsync(solicitacaoId, viaturaId, userId);
        
        if (!result)
        {
            return BadRequest(new { message = "Failed to assign viatura to solicitação" });
        }
        
        return Ok(new { message = "Viatura assigned to solicitação successfully" });
    }
    
    [HttpPut("{solicitacaoId}/viatura/{viaturaId}/status")]
    [Authorize(Roles = "Admin,Firefighter")]
    public async Task<IActionResult> UpdateViaturaStatus(
        int solicitacaoId, 
        int viaturaId, 
        [FromBody] UpdateViaturaStatusDto dto)
    {
        var userId = User.FindFirstValue("userId") ?? "";
        var result = await _solicitacaoService.UpdateSolicitacaoViaturaStatusAsync(
            solicitacaoId, viaturaId, dto.Status, userId);
        
        if (!result)
        {
            return BadRequest(new { message = "Failed to update viatura status" });
        }
        
        return Ok(new { message = "Viatura status updated successfully" });
    }
    
    [HttpDelete("{solicitacaoId}/viatura/{viaturaId}")]
    [Authorize(Roles = "Admin,Firefighter")]
    public async Task<IActionResult> RemoveViatura(int solicitacaoId, int viaturaId)
    {
        var result = await _solicitacaoService.RemoveViaturaFromSolicitacaoAsync(solicitacaoId, viaturaId);
        
        if (!result)
        {
            return BadRequest(new { message = "Failed to remove viatura from solicitação" });
        }
        
        return Ok(new { message = "Viatura removed from solicitação successfully" });
    }
    
    [HttpGet("minhas")]
    [Authorize]
    public async Task<IActionResult> GetMinhasSolicitacoes()
    {
        var userId = User.FindFirstValue("userId") ?? "";
        var solicitacoes = await _solicitacaoService.GetMinhasSolicitacoesAsync(userId);
        return Ok(solicitacoes);
    }
    
    [HttpGet("em-atendimento")]
    public async Task<IActionResult> GetEmAtendimento([FromQuery] string? quartel = null)
    {
        var solicitacoes = await _solicitacaoService.GetSolicitacoesEmAtendimentoAsync(quartel);
        return Ok(solicitacoes);
    }
    
    [HttpGet("mapa")]
    public async Task<IActionResult> GetSolicitacoesParaMapa()
    {
        var solicitacoes = await _solicitacaoService.GetAllSolicitacoesAsync();
        
        var solicitacoesMapa = solicitacoes
            .Where(s => s.Latitude.HasValue && s.Longitude.HasValue)
            .Select(s => new SolicitacaoMapaDto
            {
                Id = s.Id,
                Protocolo = s.Protocolo,
                Tipo = s.Tipo,
                Status = s.Status,
                Prioridade = s.Prioridade,
                Latitude = s.Latitude.Value,
                Longitude = s.Longitude.Value,
                Endereco = s.Endereco,
                Titulo = s.Titulo
            })
            .ToList();
        
        return Ok(solicitacoesMapa);
    }
    
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var solicitacoes = await _solicitacaoService.GetAllSolicitacoesAsync();
        
        var dashboard = new SolicitacaoDashboardDto
        {
            TotalAbertas = solicitacoes.Count(s => s.Status == "Aberta"),
            TotalEmAtendimento = solicitacoes.Count(s => s.Status == "Em Atendimento"),
            TotalFinalizadas = solicitacoes.Count(s => s.Status == "Finalizada"),
            TotalEmergencia = solicitacoes.Count(s => s.Prioridade == "Emergência"),
            PorTipo = solicitacoes
                .GroupBy(s => s.Tipo)
                .Select(g => new SolicitacaoPorTipo
                {
                    Tipo = g.Key,
                    Quantidade = g.Count()
                })
                .ToList(),
            PorQuartel = solicitacoes
                .Where(s => !string.IsNullOrEmpty(s.Viatura.FirstOrDefault()?.Quartel))
                .GroupBy(s => s.Viatura.FirstOrDefault()?.Quartel)
                .Select(g => new SolicitacaoPorQuartel
                {
                    Quartel = g.Key ?? "Desconhecido",
                    Quantidade = g.Count()
                })
                .ToList()
        };
        
        return Ok(dashboard);
    }
    
    [HttpGet("resumo")]
    [Authorize]
    public async Task<IActionResult> GetResumo()
    {
        var userId = User.FindFirstValue("userId");
        var userRoles = User.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .ToList();
        
        var solicitacoes = userRoles.Contains("Admin") || userRoles.Contains("Firefighter")
            ? await _solicitacaoService.GetAllSolicitacoesAsync()
            : await _solicitacaoService.GetMinhasSolicitacoesAsync(userId ?? "");
        
        var resumo = solicitacoes
            .OrderByDescending(s => s.DataAbertura)
            .Take(10)
            .Select(s => new SolicitacaoResumoDto
            {
                Id = s.Id,
                Protocolo = s.Protocolo,
                Tipo = s.Tipo,
                Titulo = s.Titulo,
                Status = s.Status,
                Prioridade = s.Prioridade,
                DataAbertura = s.DataAbertura,
                Endereco = s.Endereco,
                ViaturaCount = s.Viatura.Count
            })
            .ToList();
        
        return Ok(resumo);
    }
}
