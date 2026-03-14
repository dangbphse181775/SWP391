using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bike_Link.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPostingFeeRateConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "SystemConfigs",
                columns: new[] { "Key", "Description", "UpdatedAt", "Value" },
                values: new object[] { "posting_fee_rate", "Phí đăng bài (1% giá xe)", null, "0.01" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "SystemConfigs",
                keyColumn: "Key",
                keyValue: "posting_fee_rate");
        }
    }
}
