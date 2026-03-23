using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bike_Link.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWithdrawalBankInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BankAccountName",
                table: "WalletTransactions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccountNumber",
                table: "WalletTransactions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankName",
                table: "WalletTransactions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BankAccountName",
                table: "WalletTransactions");

            migrationBuilder.DropColumn(
                name: "BankAccountNumber",
                table: "WalletTransactions");

            migrationBuilder.DropColumn(
                name: "BankName",
                table: "WalletTransactions");
        }
    }
}
