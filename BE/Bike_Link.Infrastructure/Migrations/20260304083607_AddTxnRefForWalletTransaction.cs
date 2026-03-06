using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bike_Link.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTxnRefForWalletTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TxnRef",
                table: "WalletTransactions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TxnRef",
                table: "WalletTransactions");
        }
    }
}
