namespace ActivosService.Models
{
    public class HistorialDepreciacion
    {
        public int Id { get; set; }
        public int ActivoId { get; set; }
        public int Anio { get; set; }
        public decimal DepreciacionAnual { get; set; }
        public decimal DepreciacionAcumulada { get; set; }
        public decimal ValorEnLibros { get; set; }
    }
}