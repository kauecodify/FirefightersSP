namespace FirefightersSP.Backend.Models;

public class Sensor
{
    public int Id { get; set; }
    public string Identificacao { get; set; } = string.Empty; // ID único do sensor
    public string Tipo { get; set; } = string.Empty; // GPS, Combustível, Temperatura, etc.
    public int ViaturaId { get; set; }
    public string? Descricao { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime DataInstalacao { get; set; } = DateTime.UtcNow;
    public DateTime? DataUltimaLeitura { get; set; }
    
    // Navegação
    public virtual Viatura? Viatura { get; set; }
    public virtual ICollection<SensorLeitura>? Leituras { get; set; }
}

public class SensorLeitura
{
    public int Id { get; set; }
    public int SensorId { get; set; }
    public string Valor { get; set; } = string.Empty; // Valor bruto do sensor
    public string? Unidade { get; set; } // °C, %, etc.
    public DateTime DataLeitura { get; set; } = DateTime.UtcNow;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool Alertado { get; set; } = false;
    
    // Navegação
    public virtual Sensor? Sensor { get; set; }
}
