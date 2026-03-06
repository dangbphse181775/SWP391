using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bike_Link.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStatusForWalletTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "WalletTransactions",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "WalletTransactions");
        }
    }
}
