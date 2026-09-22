using Microsoft.EntityFrameworkCore;
using ActivosService.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Habilitar los controladores para que reconozca ActivosController
builder.Services.AddControllers();

// 2. Configurar la conexión a la base de datos ActivosDB
builder.Services.AddDbContext<ActivosDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// 3. Mapear las rutas (endpoints) de la API
app.MapControllers();

// 4. Iniciar la aplicación
app.Run();