using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VolunteerHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReminderFlagsToUserEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Reminder1hSent",
                table: "UserEvents",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Reminder24hSent",
                table: "UserEvents",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Reminder1hSent",
                table: "UserEvents");

            migrationBuilder.DropColumn(
                name: "Reminder24hSent",
                table: "UserEvents");
        }
    }
}
