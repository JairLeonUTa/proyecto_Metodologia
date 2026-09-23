using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ActivosService.Migrations
{
    /// <inheritdoc />
    public partial class AgregarEstadoActivo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EsActivo",
                table: "Activos",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EsActivo",
                table: "Activos");
        }
    }
}