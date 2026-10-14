namespace FirefightersSP.Backend.Models;

public class Plantao
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty; // Ex: "Plantão Diurno - Quartel Central"
    public string? Descricao { get; set; }
    public DateTime DataInicio { get; set; } = DateTime.UtcNow;
    public DateTime DataFim { get; set; }
    public string Status { get; set; } = "Ativo"; // Ativo, Finalizado, Cancelado
    public string? Quartel { get; set; }
    public int MaxViatura { get; set; } = 10;
    public int MaxBombeiros { get; set; } = 20;
    
    // Navegação
    public virtual ICollection<PlantaoViatura>? PlantaoViatura { get; set; }
    public virtual ICollection<PlantaoBombeiro>? PlantaoBombeiro { get; set; }
}

public class PlantaoViatura
{
    public int PlantaoId { get; set; }
    public int ViaturaId { get; set; }
    public DateTime DataAlocacao { get; set; } = DateTime.UtcNow;
    public string? Status { get; set; } = "Alocada";
    
    public virtual Plantao? Plantao { get; set; }
    public virtual Viatura? Viatura { get; set; }
}

public class PlantaoBombeiro
{
    public int PlantaoId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime DataAlocacao { get; set; } = DateTime.UtcNow;
    public string? Funcao { get; set; } // Motorista, Comandante, Bombeiro, etc.
    public string? Status { get; set; } = "Presente";
    
    public virtual Plantao? Plantao { get; set; }
    public virtual User? User { get; set; }
}
