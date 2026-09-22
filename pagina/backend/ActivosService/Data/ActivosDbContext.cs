using Microsoft.EntityFrameworkCore;
using ActivosService.Models;

namespace ActivosService.Data
{
    public class ActivosDbContext : DbContext
    {
        public ActivosDbContext(DbContextOptions<ActivosDbContext> options) : base(options) { }
        
        public DbSet<Activo> Activos { get; set; }
        public DbSet<CategoriaActivo> CategoriasActivo { get; set; }
        public DbSet<HistorialDepreciacion> HistorialDepreciacion { get; set; }
    }
}