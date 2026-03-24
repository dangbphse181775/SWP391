using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bike_Link.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddShippingProofUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ShippingProofUrl",
                table: "Orders",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShippingProofUrl",
                table: "Orders");
        }
    }
}
