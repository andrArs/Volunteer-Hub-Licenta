using Microsoft.EntityFrameworkCore;

namespace VolunteerHub.Api.src.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
}
