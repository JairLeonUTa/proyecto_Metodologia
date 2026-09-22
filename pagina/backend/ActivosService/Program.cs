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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// 3. Habilitar controladores
builder.Services.AddControllers();

// 4. Configurar la conexión a la base de datos ActivosDB
builder.Services.AddDbContext<ActivosDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// 5. Configurar el orden del Middleware
app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

// 6. Mapear las rutas (endpoints) de la API
app.MapControllers();

app.Run();