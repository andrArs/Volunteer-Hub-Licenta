using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VolunteerHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCheckInToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CheckInToken",
                table: "Events",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CheckInToken",
                table: "Events");
        }
    }
}
