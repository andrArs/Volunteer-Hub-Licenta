using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VolunteerHub.Api.src.Entities;

namespace VolunteerHub.Api.src.Data;

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Event> Events { get; set; } = null!;
    public DbSet<UserEvent> UserEvents { get; set; } = null!; 

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<UserEvent>()
            .HasKey(ue => new { ue.UserId, ue.EventId });

        builder.Entity<UserEvent>()
            .HasOne(ue => ue.User)
            .WithMany()
            .HasForeignKey(ue => ue.UserId);

        builder.Entity<UserEvent>()
            .HasOne(ue => ue.Event)
            .WithMany(e => e.UserEvents)
            .HasForeignKey(ue => ue.EventId);
    } 
}
