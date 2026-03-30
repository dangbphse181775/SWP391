using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Bike_Link.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDisputeResolution : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminNote",
                table: "Disputes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EvidenceUrls",
                table: "Disputes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RefundAmount",
                table: "Disputes",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Resolution",
                table: "Disputes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResolvedAt",
                table: "Disputes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ResolvedByUserId",
                table: "Disputes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SellerResponse",
                table: "Disputes",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DisputeChats",
                columns: table => new
                {
                    DisputeChatId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DisputeId = table.Column<int>(type: "integer", nullable: false),
                    SenderId = table.Column<int>(type: "integer", nullable: false),
                    Channel = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisputeChats", x => x.DisputeChatId);
                    table.ForeignKey(
                        name: "FK_DisputeChats_Disputes_DisputeId",
                        column: x => x.DisputeId,
                        principalTable: "Disputes",
                        principalColumn: "DisputeId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DisputeChats_Users_SenderId",
                        column: x => x.SenderId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "SystemConfigs",
                columns: new[] { "Key", "Description", "UpdatedAt", "Value" },
                values: new object[] { "dispute_window_days", "Thời hạn mở tranh chấp sau khi nhận hàng (ngày)", null, "3" });

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_ResolvedByUserId",
                table: "Disputes",
                column: "ResolvedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeChats_DisputeId",
                table: "DisputeChats",
                column: "DisputeId");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeChats_SenderId",
                table: "DisputeChats",
                column: "SenderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Disputes_Users_ResolvedByUserId",
                table: "Disputes",
                column: "ResolvedByUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Disputes_Users_ResolvedByUserId",
                table: "Disputes");

            migrationBuilder.DropTable(
                name: "DisputeChats");

            migrationBuilder.DropIndex(
                name: "IX_Disputes_ResolvedByUserId",
                table: "Disputes");

            migrationBuilder.DeleteData(
                table: "SystemConfigs",
                keyColumn: "Key",
                keyValue: "dispute_window_days");

            migrationBuilder.DropColumn(
                name: "AdminNote",
                table: "Disputes");

            migrationBuilder.DropColumn(
                name: "EvidenceUrls",
                table: "Disputes");

            migrationBuilder.DropColumn(
                name: "RefundAmount",
                table: "Disputes");

            migrationBuilder.DropColumn(
                name: "Resolution",
                table: "Disputes");

            migrationBuilder.DropColumn(
                name: "ResolvedAt",
                table: "Disputes");

            migrationBuilder.DropColumn(
                name: "ResolvedByUserId",
                table: "Disputes");

            migrationBuilder.DropColumn(
                name: "SellerResponse",
                table: "Disputes");
        }
    }
}
