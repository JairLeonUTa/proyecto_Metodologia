using Microsoft.EntityFrameworkCore;
using AuthService.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Habilitar controladores
builder.Services.AddControllers();

// 2. Configurar base de datos
builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Configurar CORS (DEBE ESTAR ANTES DEL BUILD)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// 4. Usar CORS 
app.UseCors("AllowReactApp");

// 5. Mapear rutas y ejecutar
app.MapControllers();
app.Run();