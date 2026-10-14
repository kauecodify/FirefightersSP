namespace FirefightersSP.Backend.Models;

public class Viatura
{
    public int Id { get; set; }
    public string Identificacao { get; set; } = string.Empty; // Ex: "AB-1234"
    public string Tipo { get; set; } = string.Empty; // Auto Bomba, Resgate, Ambulância, etc.
    public string Modelo { get; set; } = string.Empty;
    public string Placa { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Status { get; set; } = "Disponível"; // Disponível, Em Atendimento, Manutenção, etc.
    public string? LocalizacaoAtual { get; set; }
    public string? QuartelBase { get; set; }
    public int Capacidade { get; set; } = 1;
    public bool Ativa { get; set; } = true;
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
    public DateTime? DataUltimaManutencao { get; set; }
    
    // Sensores
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public double? Velocidade { get; set; }
    public double? NivelCombustivel { get; set; }
    public DateTime? UltimaAtualizacaoSensor { get; set; }
    
    // Navegação
    public virtual ICollection<PlantaoViatura>? PlantaoViatura { get; set; }
    public virtual ICollection<SolicitacaoViatura>? SolicitacaoViatura { get; set; }
    public virtual ICollection<User>? UsuariosPreferencia { get; set; }
}
