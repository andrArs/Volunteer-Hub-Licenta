using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VolunteerHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddConversationTitle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "AiConversations",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Title",
                table: "AiConversations");
        }
    }
}
