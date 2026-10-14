namespace FirefightersSP.Backend.Models;

public class Solicitacao
{
    public int Id { get; set; }
    public string Protocolo { get; set; } = string.Empty; // Número único de protocolo
    public string Tipo { get; set; } = string.Empty; // Incêndio, Resgate, Socorro Médico, etc.
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Status { get; set; } = "Aberta"; // Aberta, Em Atendimento, Finalizada, Cancelada
    public string Prioridade { get; set; } = "Normal"; // Baixa, Normal, Alta, Emergência
    
    // Localização
    public string? Endereco { get; set; }
    public string? Bairro { get; set; }
    public string? Cidade { get; set; }
    public string? CEP { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    
    // Solicitante
    public string? NomeSolicitante { get; set; }
    public string? TelefoneSolicitante { get; set; }
    public string? UserId { get; set; } // Usuário que criou (se autenticado)
    
    // Atendimento
    public DateTime DataAbertura { get; set; } = DateTime.UtcNow;
    public DateTime? DataInicioAtendimento { get; set; }
    public DateTime? DataFimAtendimento { get; set; }
    public string? Observacoes { get; set; }
    
    // Navegação
    public virtual User? User { get; set; }
    public virtual ICollection<SolicitacaoViatura>? SolicitacaoViatura { get; set; }
    public virtual ICollection<SolicitacaoHistorico>? Historico { get; set; }
}

public class SolicitacaoViatura
{
    public int SolicitacaoId { get; set; }
    public int ViaturaId { get; set; }
    public DateTime DataAlocacao { get; set; } = DateTime.UtcNow;
    public string? Status { get; set; } = "Designada"; // Designada, A Caminho, No Local, Finalizada
    public DateTime? DataChegada { get; set; }
    public DateTime? DataSaida { get; set; }
    
    public virtual Solicitacao? Solicitacao { get; set; }
    public virtual Viatura? Viatura { get; set; }
}

public class SolicitacaoHistorico
{
    public int Id { get; set; }
    public int SolicitacaoId { get; set; }
    public string StatusAnterior { get; set; } = string.Empty;
    public string StatusNovo { get; set; } = string.Empty;
    public DateTime DataAlteracao { get; set; } = DateTime.UtcNow;
    public string? UserId { get; set; } // Quem alterou
    public string? Observacoes { get; set; }
    
    public virtual Solicitacao? Solicitacao { get; set; }
    public virtual User? User { get; set; }
}
