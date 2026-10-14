using FirefightersSP.Backend.Data;
using FirefightersSP.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace FirefightersSP.Backend.Services;

public class SolicitacaoService
{
    private readonly ApplicationDbContext _context;
    private readonly ViaturaService _viaturaService;
    private readonly NotificationService _notificationService;
    
    public SolicitacaoService(
        ApplicationDbContext context,
        ViaturaService viaturaService,
        NotificationService notificationService)
    {
        _context = context;
        _viaturaService = viaturaService;
        _notificationService = notificationService;
    }
    
    public async Task<List<SolicitacaoDto>> GetAllSolicitacoesAsync(
        string? status = null,
        string? prioridade = null,
        string? tipo = null,
        string? quartel = null)
    {
        var query = _context.Solicitacao.AsQueryable();
        
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(s => s.Status == status);
        }
        
        if (!string.IsNullOrEmpty(prioridade))
        {
            query = query.Where(s => s.Prioridade == prioridade);
        }
        
        if (!string.IsNullOrEmpty(tipo))
        {
            query = query.Where(s => s.Tipo == tipo);
        }
        
        if (!string.IsNullOrEmpty(quartel))
        {
            query = query.Where(s => s.SolicitacaoViatura.Any(sv => sv.Viatura.QuartelBase == quartel));
        }
        
        var solicitacoes = await query
            .OrderByDescending(s => s.DataAbertura)
            .Include(s => s.User)
            .Include(s => s.SolicitacaoViatura)
                .ThenInclude(sv => sv.Viatura)
            .Include(s => s.Historico)
                .ThenInclude(h => h.User)
            .ToListAsync();
        
        return solicitacoes.Select(MapToDto).ToList();
    }
    
    public async Task<SolicitacaoDto?> GetSolicitacaoByIdAsync(int id)
    {
        var solicitacao = await _context.Solicitacao
            .Include(s => s.User)
            .Include(s => s.SolicitacaoViatura)
                .ThenInclude(sv => sv.Viatura)
            .Include(s => s.Historico)
                .ThenInclude(h => h.User)
            .FirstOrDefaultAsync(s => s.Id == id);
        
        return solicitacao != null ? MapToDto(solicitacao) : null;
    }
    
    public async Task<SolicitacaoDto?> GetSolicitacaoByProtocoloAsync(string protocolo)
    {
        var solicitacao = await _context.Solicitacao
            .Include(s => s.User)
            .Include(s => s.SolicitacaoViatura)
                .ThenInclude(sv => sv.Viatura)
            .Include(s => s.Historico)
                .ThenInclude(h => h.User)
            .FirstOrDefaultAsync(s => s.Protocolo == protocolo);
        
        return solicitacao != null ? MapToDto(solicitacao) : null;
    }
    
    public async Task<SolicitacaoDto> CreateSolicitacaoAsync(CreateSolicitacaoDto dto, string? userId = null)
    {
        // Generate protocol
        var year = DateTime.UtcNow.Year;
        var lastSolicitacao = await _context.Solicitacao
            .Where(s => s.Protocolo.StartsWith($"{year}-"))
            .OrderByDescending(s => s.Protocolo)
            .FirstOrDefaultAsync();
        
        var sequence = lastSolicitacao != null 
            ? int.Parse(lastSolicitacao.Protocolo.Split('-')[1]) + 1
            : 1;
        var protocolo = $"{year}-{sequence:D4}";
        
        var solicitacao = new Solicitacao
        {
            Protocolo = protocolo,
            Tipo = dto.Tipo,
            Titulo = dto.Titulo,
            Descricao = dto.Descricao,
            Status = "Aberta",
            Prioridade = dto.Prioridade,
            Endereco = dto.Endereco,
            Bairro = dto.Bairro,
            Cidade = dto.Cidade,
            CEP = dto.CEP,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            NomeSolicitante = dto.NomeSolicitante,
            TelefoneSolicitante = dto.TelefoneSolicitante,
            UserId = userId,
            DataAbertura = DateTime.UtcNow,
            Observacoes = dto.Observacoes
        };
        
        _context.Solicitacao.Add(solicitacao);
        await _context.SaveChangesAsync();
        
        // Add to history
        await AddToHistorico(solicitacao.Id, "", "Aberta", userId, "Solicitação criada");
        
        // Notify
        await _notificationService.NotifyNewSolicitacao(solicitacao);
        
        return MapToDto(solicitacao);
    }
    
    public async Task<SolicitacaoDto?> UpdateSolicitacaoAsync(int id, UpdateSolicitacaoDto dto, string userId)
    {
        var solicitacao = await _context.Solicitacao.FindAsync(id);
        if (solicitacao == null) return null;
        
        var oldStatus = solicitacao.Status;
        
        solicitacao.Tipo = dto.Tipo;
        solicitacao.Titulo = dto.Titulo;
        solicitacao.Descricao = dto.Descricao;
        solicitacao.Prioridade = dto.Prioridade;
        solicitacao.Endereco = dto.Endereco;
        solicitacao.Bairro = dto.Bairro;
        solicitacao.Cidade = dto.Cidade;
        solicitacao.CEP = dto.CEP;
        solicitacao.Latitude = dto.Latitude;
        solicitacao.Longitude = dto.Longitude;
        solicitacao.NomeSolicitante = dto.NomeSolicitante;
        solicitacao.TelefoneSolicitante = dto.TelefoneSolicitante;
        solicitacao.Observacoes = dto.Observacoes;
        
        if (dto.Status != null && solicitacao.Status != dto.Status)
        {
            solicitacao.Status = dto.Status;
            
            // Update timestamps based on status
            if (dto.Status == "Em Atendimento" && solicitacao.DataInicioAtendimento == null)
            {
                solicitacao.DataInicioAtendimento = DateTime.UtcNow;
            }
            else if (dto.Status == "Finalizada" && solicitacao.DataFimAtendimento == null)
            {
                solicitacao.DataFimAtendimento = DateTime.UtcNow;
            }
            
            // Add to history
            await AddToHistorico(id, oldStatus, dto.Status, userId, dto.Observacoes);
            
            // Notify
            await _notificationService.NotifyStatusChange(solicitacao, oldStatus, dto.Status);
        }
        
        await _context.SaveChangesAsync();
        
        return MapToDto(solicitacao);
    }
    
    public async Task<bool> DeleteSolicitacaoAsync(int id)
    {
        var solicitacao = await _context.Solicitacao.FindAsync(id);
        if (solicitacao == null) return false;
        
        _context.Solicitacao.Remove(solicitacao);
        await _context.SaveChangesAsync();
        
        return true;
    }
    
    public async Task<bool> AssignViaturaToSolicitacaoAsync(int solicitacaoId, int viaturaId, string userId)
    {
        var solicitacao = await _context.Solicitacao.FindAsync(solicitacaoId);
        var viatura = await _context.Viatura.FindAsync(viaturaId);
        
        if (solicitacao == null || viatura == null) return false;
        
        // Check if already assigned
        var existing = await _context.SolicitacaoViatura
            .FirstOrDefaultAsync(sv => sv.SolicitacaoId == solicitacaoId && sv.ViaturaId == viaturaId);
        
        if (existing != null) return false;
        
        // Update viatura status
        viatura.Status = "Em Atendimento";
        
        // Update solicitacao status if it was "Aberta"
        if (solicitacao.Status == "Aberta")
        {
            solicitacao.Status = "Em Atendimento";
            solicitacao.DataInicioAtendimento = DateTime.UtcNow;
            await AddToHistorico(solicitacaoId, "Aberta", "Em Atendimento", userId, "Viatura designada");
        }
        
        _context.SolicitacaoViatura.Add(new SolicitacaoViatura
        {
            SolicitacaoId = solicitacaoId,
            ViaturaId = viaturaId,
            Status = "Designada",
            DataAlocacao = DateTime.UtcNow
        });
        
        await _context.SaveChangesAsync();
        
        // Notify
        await _notificationService.NotifyViaturaAssigned(solicitacao, viatura);
        
        return true;
    }
    
    public async Task<bool> UpdateSolicitacaoViaturaStatusAsync(
        int solicitacaoId, 
        int viaturaId, 
        string status,
        string userId)
    {
        var assignment = await _context.SolicitacaoViatura
            .FirstOrDefaultAsync(sv => sv.SolicitacaoId == solicitacaoId && sv.ViaturaId == viaturaId);
        
        if (assignment == null) return false;
        
        var oldStatus = assignment.Status;
        assignment.Status = status;
        
        if (status == "No Local")
        {
            assignment.DataChegada = DateTime.UtcNow;
        }
        else if (status == "Finalizada")
        {
            assignment.DataSaida = DateTime.UtcNow;
        }
        
        await _context.SaveChangesAsync();
        
        // Add to history
        var solicitacao = await _context.Solicitacao.FindAsync(solicitacaoId);
        if (solicitacao != null)
        {
            await AddToHistorico(
                solicitacaoId, 
                oldStatus, 
                status, 
                userId, 
                $