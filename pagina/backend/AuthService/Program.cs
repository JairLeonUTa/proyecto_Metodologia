using Microsoft.EntityFrameworkCore;
using AuthService.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Habilitar los controladores (necesario para que reconozca tu AuthController)
builder.Services.AddControllers();

// 2. Configurar la conexión a SQL Server usando Entity Framework
builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

app.UseCors("AllowReactApp");
// 3. Mapear las rutas de los controladores (hace que las URLs de la API funcionen)
app.MapControllers();

// 4. Iniciar la aplicación
app.Run();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});