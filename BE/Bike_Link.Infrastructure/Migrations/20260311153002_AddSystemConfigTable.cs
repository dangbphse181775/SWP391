using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Bike_Link.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemConfigTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SystemConfigs",
                columns: table => new
                {
                    Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemConfigs", x => x.Key);
                });

            migrationBuilder.InsertData(
                table: "SystemConfigs",
                columns: new[] { "Key", "Description", "UpdatedAt", "Value" },
                values: new object[,]
                {
                    { "cancel_refund_rate", "Tỉ lệ hoàn tiền khi hủy cọc (95%)", null, "0.95" },
                    { "deposit_expiry_hours", "Thời hạn đặt cọc (giờ)", null, "72" },
                    { "deposit_rate", "Tỉ lệ đặt cọc (20%)", null, "0.20" },
                    { "expired_seller_rate", "Tỉ lệ seller nhận khi cọc quá hạn (80%)", null, "0.80" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SystemConfigs");
        }
    }
}
