using System.Net;
using System.Net.Mail;

namespace VolunteerHub.Api.src.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendAsync(string to, string subject, string body)
    {
        var host = _config["Smtp:Host"]!;
        var port = int.Parse(_config["Smtp:Port"]!);
        var username = _config["Smtp:Username"]!;
        var password = _config["Smtp:Password"]!;
        var from = _config["Smtp:From"]!;

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = true
        };

        var message = new MailMessage(from, to, subject, body);
        await client.SendMailAsync(message);
    }
}
