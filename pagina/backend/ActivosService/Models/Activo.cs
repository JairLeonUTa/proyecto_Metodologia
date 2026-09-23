namespace ActivosService.Models
{
    public class Activo
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal ValorCompra { get; set; }
        public int CategoriaId { get; set; }
        public int UsuarioID { get; set; } // INT normal, sin FK
        public bool EsActivo { get; set; } = true;
    }
}