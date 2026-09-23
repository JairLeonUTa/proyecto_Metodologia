using Microsoft.EntityFrameworkCore;
using ActivosService.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar políticas CORS para React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// 2. Configurar la validación de Tokens JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? ""))
        };
    });

// 3. Habilitar controladores
builder.Services.AddControllers();

// 4. Configurar conexión a la base de datos ActivosDB
builder.Services.AddDbContext<ActivosDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// --- PIPELINE DE MIDDLEWARES (EL ORDEN ES ESTRICTO) ---

// A. Aplicar CORS primero
app.UseCors("AllowReactApp");

// B. Autenticación y Autorización después
app.UseAuthentication();
app.UseAuthorization();

// C. Mapear controladores al final
app.MapControllers();

app.Run();