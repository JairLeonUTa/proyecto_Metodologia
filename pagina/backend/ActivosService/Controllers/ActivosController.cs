using Microsoft.AspNetCore.Mvc;
using ActivosService.Data;
using ActivosService.Models;

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