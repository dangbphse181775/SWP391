using Bike_Link.Application.IService;
using Bike_Link.Application.Services;
using Bike_Link.Domain.IRepository;
using Bike_Link.Infrastructure.Persitence.Repository;
using CloudinaryDotNet;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<NpgsqlDataSource>(_ =>
{
    var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
    return NpgsqlDataSource.Create(connStr);
});

//seller service and repository
builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<ISellerService, SellerService>();

//buyer -> seller
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();


// Cloudinary
builder.Services.AddSingleton(sp =>
{
    var cfg = sp.GetRequiredService<IConfiguration>().GetSection("Cloudinary");
    var acc = new Account(
        cfg["CloudName"],
        cfg["ApiKey"],
        cfg["ApiSecret"]
    );
    return new Cloudinary(acc);
});

var app = builder.Build();

// Swagger only in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BikeLink API v1");
        c.RoutePrefix = "swagger"; // mở tại /swagger
    });
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
