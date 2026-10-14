using Microsoft.AspNetCore.Identity;

namespace FirefightersSP.Backend.Models;

public class User : IdentityUser
{
    public string? NomeCompleto { get; set; }
    public string? CPF { get; set; }
    public string? Matricula { get; set; }
    public string? Cargo { get; set; } // Bombeiro, Motorista, Admin, etc.
    public string? Quartel { get; set; }
    public string? GoogleId { get; set; }
    public string? PictureUrl { get; set; }
    public DateTime? DataNascimento { get; set; }
    public string? Endereco { get; set; }
    public string? Telefone { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
    public DateTime? UltimoLogin { get; set; }
    
    // Navegação
    public virtual ICollection<Viatura>? ViaturaPreferencias { get; set; }
    public virtual ICollection<Plantao>? PlantaoParticipacoes { get; set; }
    public virtual ICollection<Solicitacao>? Solicitacoes { get; set; }
}
