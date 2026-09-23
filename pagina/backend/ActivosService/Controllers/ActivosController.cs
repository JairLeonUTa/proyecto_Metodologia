using Microsoft.AspNetCore.Mvc;
using ActivosService.Data;
using ActivosService.Models;
using System.IO;
using System.Linq;
using ClosedXML.Excel;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;

namespace ActivosService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ActivosController : ControllerBase
    {
        private readonly ActivosDbContext _context;

        public ActivosController(ActivosDbContext context)
        {
            _context = context;
        }

        [HttpPost("registrar")]
        public IActionResult RegistrarActivo([FromBody] RegistroActivoRequest request)
        {
            // 1. Validar la categoría
            var categoria = _context.CategoriasActivo.Find(request.CategoriaId);
            if (categoria == null) return BadRequest("Categoría no encontrada.");

            // 2. Guardar el activo principal
            var nuevoActivo = new Activo
            {
                Nombre = request.Nombre,
                ValorCompra = request.ValorCompra,
                CategoriaId = request.CategoriaId,
                UsuarioID = request.UsuarioID
            };

            _context.Activos.Add(nuevoActivo);
            _context.SaveChanges(); // Guardamos para obtener el ActivoId generado

            // 3. Cálculo LORTI
            decimal valorResidual = request.ValorCompra * 0.10m;
            decimal valorADepreciar = request.ValorCompra - valorResidual;
            decimal depreciacionAnual = valorADepreciar / categoria.AniosVidaUtil;

            decimal depreciacionAcumulada = 0m;
            decimal valorEnLibrosActual = request.ValorCompra;

            // 4. Generar el historial de depreciación por cada año de vida útil
            for (int anio = 1; anio <= categoria.AniosVidaUtil; anio++)
            {
                depreciacionAcumulada += depreciacionAnual;
                valorEnLibrosActual -= depreciacionAnual;

                var historial = new HistorialDepreciacion
                {
                    ActivoId = nuevoActivo.Id,
                    Anio = anio,
                    DepreciacionAnual = Math.Round(depreciacionAnual, 2),
                    DepreciacionAcumulada = Math.Round(depreciacionAcumulada, 2),
                    ValorEnLibros = Math.Round(valorEnLibrosActual, 2)
                };

                _context.HistorialDepreciacion.Add(historial);
            }

            _context.SaveChanges();

            return Ok(new { message = "Activo e historial de depreciación registrados con éxito.", activoId = nuevoActivo.Id });
        }

        [HttpPut("baja/{id}")]
        public IActionResult DarDeBaja(int id)
        {
            var activo = _context.Activos.Find(id);
            
            if (activo == null)
            {
                return NotFound(new { message = "Activo no encontrado." });
            }

            if (!activo.EsActivo)
            {
                return BadRequest(new { message = "El activo ya se encuentra dado de baja." });
            }

            activo.EsActivo = false;
            _context.SaveChanges();

            return Ok(new { message = $"El activo con ID {id} ha sido dado de baja exitosamente, deteniendo su depreciación futura." });
        }

        [HttpGet("reporte/excel/{id}")]
        public IActionResult GenerarReporteExcel(int id)
        {
            var activo = _context.Activos.Find(id);
            if (activo == null) return NotFound(new { message = "Activo no encontrado." });

            // Buscamos el historial de este activo
            var historial = _context.HistorialDepreciacion.Where(h => h.ActivoId == id).ToList();

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Amortización");
                
                // Encabezados
                worksheet.Cell(1, 1).Value = "Año";
                worksheet.Cell(1, 2).Value = "Depreciación Anual";
                worksheet.Cell(1, 3).Value = "Depreciación Acumulada";
                worksheet.Cell(1, 4).Value = "Valor en Libros";

                // Llenado de datos
                int fila = 2;
                foreach (var item in historial)
                {
                    worksheet.Cell(fila, 1).Value = item.Anio;
                    worksheet.Cell(fila, 2).Value = item.DepreciacionAnual;
                    worksheet.Cell(fila, 3).Value = item.DepreciacionAcumulada;
                    worksheet.Cell(fila, 4).Value = item.ValorEnLibros;
                    fila++;
                }

                // Convertir a archivo descargable
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Reporte_{activo.Nombre}.xlsx");
                }
            }
        }

        [HttpGet("reporte/pdf/{id}")]
        public IActionResult GenerarReportePdf(int id)
        {
            var activo = _context.Activos.Find(id);
            if (activo == null) return NotFound(new { message = "Activo no encontrado." });

            var historial = _context.HistorialDepreciacion.Where(h => h.ActivoId == id).ToList();

            using (var stream = new MemoryStream())
            {
                var writer = new PdfWriter(stream);
                var pdf = new PdfDocument(writer);
                var document = new Document(pdf);

                // Título
                document.Add(new Paragraph($"Tabla de Amortización - {activo.Nombre}")
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetFontSize(16));

                // Crear tabla de 4 columnas
                var table = new Table(4, true);
                table.AddHeaderCell("Año");
                table.AddHeaderCell("Dep. Anual");
                table.AddHeaderCell("Dep. Acumulada");
                table.AddHeaderCell("Valor Libros");

                foreach (var item in historial)
                {
                    table.AddCell(item.Anio.ToString());
                    table.AddCell(item.DepreciacionAnual.ToString("0.00"));
                    table.AddCell(item.DepreciacionAcumulada.ToString("0.00"));
                    table.AddCell(item.ValorEnLibros.ToString("0.00"));
                }

                document.Add(table);
                document.Close();

                return File(stream.ToArray(), "application/pdf", $"Reporte_{activo.Nombre}.pdf");
            }
        }
    }

    // DTO para recibir la petición
    public class RegistroActivoRequest
    {
        public string Nombre { get; set; } = string.Empty;
        public decimal ValorCompra { get; set; }
        public int CategoriaId { get; set; }
        public int UsuarioID { get; set; }
    }
}