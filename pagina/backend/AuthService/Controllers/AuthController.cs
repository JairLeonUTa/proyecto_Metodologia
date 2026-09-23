using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuthService.Data;
using AuthService.Models; // Asegúrate de importar el namespace de tus modelos si es necesario
using BCrypt.Net;

namespace AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AuthDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // 1. Buscar al usuario en la BD
            var user = _context.Usuarios.FirstOrDefault(u => u.Username == request.Username);

            // 2. Verificar existencia y contraseña con BCrypt
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Credenciales incorrectas" });
            }

            // 3. Configurar y generar el token JWT
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.RolId.ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return Ok(new { token = tokenHandler.WriteToken(token) });
        }

        // NUEVO ENDPOINT: Registrar usuario
        [HttpPost("registrar")]
        public IActionResult RegistrarUsuario([FromBody] RegistroUsuarioRequest request)
        {
            // 1. Verificar si el usuario ya existe (usamos request.NombreUsuario mapeado a u.Username)
            var usuarioExistente = _context.Usuarios.FirstOrDefault(u => u.Username == request.NombreUsuario);
            if (usuarioExistente != null)
            {
                return BadRequest(new { message = "El nombre de usuario ya está en uso." });
            }

            // 2. Verificar que el rol exista en la base de datos
            var rol = _context.Roles.Find(request.RolId);
            if (rol == null)
            {
                return BadRequest(new { message = "El Rol especificado no existe." });
            }

            // 3. Hashear la contraseña con BCrypt
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 4. Crear el nuevo usuario mapeando los datos a tu entidad
            var nuevoUsuario = new Usuario // Ajusta "Usuario" si el nombre de tu modelo es diferente
            {
                Username = request.NombreUsuario,
                PasswordHash = passwordHash,
                RolId = request.RolId
            };

            // 5. Guardar en la base de datos (AuthDB)
            _context.Usuarios.Add(nuevoUsuario);
            _context.SaveChanges();

            return Ok(new { message = $"Usuario '{nuevoUsuario.Username}' creado exitosamente." });
        }

        // ENDPOINT AUXILIAR: Úsalo para generar tu contraseña real
        // Navega a: http://localhost:5001/api/auth/hash?password=tu_contraseña_aqui
        [HttpGet("hash")]
        public IActionResult GetHash(string password)
        {
            return Ok(new { hash = BCrypt.Net.BCrypt.HashPassword(password) });
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    // NUEVO DTO: Mapea exactamente los datos que envía tu componente Registro.jsx
    public class RegistroUsuarioRequest
    {
        public string NombreUsuario { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int RolId { get; set; }
    }
}