using FirefightersSP.Backend.Models;

namespace FirefightersSP.Backend.Services;

public class NotificationService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    
    public NotificationService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }
    
    public async Task NotifyNewSolicitacao(Solicitacao solicitacao)
    {
        // In a real implementation, this would send notifications via:
        // - Email
        // - SMS
        // - Push notifications (Firebase, etc.)
        // - WebSocket messages
        // - SignalR
        
        // For now, just log it
        Console.WriteLine($