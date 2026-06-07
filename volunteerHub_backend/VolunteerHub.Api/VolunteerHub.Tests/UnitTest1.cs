using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using VolunteerHub.Api.src.Data;
using VolunteerHub.Api.src.DTO.Events;
using VolunteerHub.Api.src.Entities;
using VolunteerHub.Api.src.Entities.Enum;
using VolunteerHub.Api.src.Exceptions;
using VolunteerHub.Api.src.Services;

namespace VolunteerHub.Tests;

[TestClass]
public class EventValidationTests
{
    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static EventRequest ValidRequest() => new(
        Title: "Test Event",
        Description: "Description",
        Category: EventCategory.Environment,
        StartDateTime: DateTime.UtcNow.AddDays(1),
        EndDateTime: DateTime.UtcNow.AddDays(2),
        LocationName: "Timisoara",
        Address: "Strada Test 1",
        Latitude: 45.7,
        Longitude: 21.2,
        MaxVolunteers: null
    );

    [TestMethod]
    public async Task CreateEvent_EndBeforeStart_Throws400()
    {
        var db = CreateDb();
        var service = new EventService(db);
        var req = ValidRequest() with
        {
            StartDateTime = DateTime.UtcNow.AddDays(2),
            EndDateTime = DateTime.UtcNow.AddDays(1)
        };

        var ex = await Assert.ThrowsExceptionAsync<ApiException>(
            () => service.CreateEventAsync("user-1", req)
        );

        Assert.AreEqual(400, ex.StatusCode);
    }

    [TestMethod]
    public async Task CreateEvent_MaxVolunteersZero_Throws400()
    {
        var db = CreateDb();
        var service = new EventService(db);
        var req = ValidRequest() with { MaxVolunteers = 0 };

        var ex = await Assert.ThrowsExceptionAsync<ApiException>(
            () => service.CreateEventAsync("user-1", req)
        );

        Assert.AreEqual(400, ex.StatusCode);
    }

    [TestMethod]
    public async Task CreateEvent_EmptyTitle_Throws400()
    {
        var db = CreateDb();
        var service = new EventService(db);
        var req = ValidRequest() with { Title = "" };

        var ex = await Assert.ThrowsExceptionAsync<ApiException>(
            () => service.CreateEventAsync("user-1", req)
        );

        Assert.AreEqual(400, ex.StatusCode);
    }

    [TestMethod]
    public async Task CreateEvent_EmptyLocation_Throws400()
    {
        var db = CreateDb();
        var service = new EventService(db);
        var req = ValidRequest() with { LocationName = "" };

        var ex = await Assert.ThrowsExceptionAsync<ApiException>(
            () => service.CreateEventAsync("user-1", req)
        );

        Assert.AreEqual(400, ex.StatusCode);
    }
}

[TestClass]
public class CheckInTests
{
    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [TestMethod]
    public async Task CheckIn_InvalidToken_Throws404()
    {
        var db = CreateDb();
        var service = new EventService(db);

        var ex = await Assert.ThrowsExceptionAsync<ApiException>(
            () => service.CheckInAsync("token-inexistent", "user-1")
        );

        Assert.AreEqual(404, ex.StatusCode);
    }

    [TestMethod]
    public async Task CheckIn_EventInFuture_Throws400()
    {
        var db = CreateDb();
        db.Events.Add(new Event
        {
            Id = Guid.NewGuid(),
            Title = "Test", Description = "D", LocationName = "L", Address = "A",
            CreatedById = "creator-1",
            CheckInToken = "token-viitor",
            StartDateTime = DateTime.UtcNow.AddDays(1),
            EndDateTime = DateTime.UtcNow.AddDays(2)
        });
        await db.SaveChangesAsync();

        var service = new EventService(db);
        var ex = await Assert.ThrowsExceptionAsync<ApiException>(
            () => service.CheckInAsync("token-viitor", "user-1")
        );

        Assert.AreEqual(400, ex.StatusCode);
    }

    [TestMethod]
    public async Task CheckIn_EventAlreadyEnded_Throws400()
    {
        var db = CreateDb();
        db.Events.Add(new Event
        {
            Id = Guid.NewGuid(),
            Title = "Test", Description = "D", LocationName = "L", Address = "A",
            CreatedById = "creator-1",
            CheckInToken = "token-trecut",
            StartDateTime = DateTime.UtcNow.AddDays(-2),
            EndDateTime = DateTime.UtcNow.AddDays(-1)
        });
        await db.SaveChangesAsync();

        var service = new EventService(db);
        var ex = await Assert.ThrowsExceptionAsync<ApiException>(
            () => service.CheckInAsync("token-trecut", "user-1")
        );

        Assert.AreEqual(400, ex.StatusCode);
    }

    [TestMethod]
    public async Task CheckIn_UserNotGoing_Throws400()
    {
        var db = CreateDb();
        var eventId = Guid.NewGuid();
        db.Events.Add(new Event
        {
            Id = eventId,
            Title = "Test", Description = "D", LocationName = "L", Address = "A",
            CreatedById = "creator-1",
            CheckInToken = "token-ok",
            StartDateTime = DateTime.UtcNow.AddMinutes(-30),
            EndDateTime = DateTime.UtcNow.AddMinutes(30)
        });
        db.Users.Add(new User { Id = "u1", UserName = "u1", DateOfBirth = new DateOnly(2000, 1, 1) });
        db.UserEvents.Add(new UserEvent { UserId = "u1", EventId = eventId, Status = UserEventStatus.Interested });
        await db.SaveChangesAsync();

        var service = new EventService(db);
        var ex = await Assert.ThrowsExceptionAsync<ApiException>(
            () => service.CheckInAsync("token-ok", "u1")
        );

        Assert.AreEqual(400, ex.StatusCode);
    }
}

[TestClass]
public class CapacityTests
{
    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [TestMethod]
    public async Task JoinEvent_WhenFull_Throws400()
    {
        var db = CreateDb();
        var eventId = Guid.NewGuid();

        db.Events.Add(new Event
        {
            Id = eventId,
            Title = "Test", Description = "D", LocationName = "L", Address = "A",
            CreatedById = "creator-1",
            MaxVolunteers = 1,
            StartDateTime = DateTime.UtcNow.AddDays(1),
            EndDateTime = DateTime.UtcNow.AddDays(2)
        });
        db.Users.AddRange(
            new User { Id = "u1", UserName = "u1", DateOfBirth = new DateOnly(2000, 1, 1) },
            new User { Id = "u2", UserName = "u2", DateOfBirth = new DateOnly(2000, 1, 1) }
        );
        db.UserEvents.Add(new UserEvent { UserId = "u1", EventId = eventId, Status = UserEventStatus.Going });
        await db.SaveChangesAsync();

        var service = new EventService(db);
        var ex = await Assert.ThrowsExceptionAsync<ApiException>(
            () => service.UpdateEventAttendanceAsync(eventId, "u2", "going")
        );

        Assert.AreEqual(400, ex.StatusCode);
    }
}
