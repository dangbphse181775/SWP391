using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Bike_Link.Application.IService;
using Bike_Link.Application.Services;
using Bike_Link.Infrastructure.Persitence.Repository;
using CloudinaryDotNet;
using Npgsql;
using System.Text;
using Bike_Link.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Bike_Link.Domain.IRepository;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "BikeLink API", Version = "v1" });

    // Cấu hình Bearer Token
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Nhập: Bearer {your JWT token}"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddSingleton<NpgsqlDataSource>(_ =>
{
    var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
    return NpgsqlDataSource.Create(connStr);
});

builder.Services.AddDbContext<BikeLinkContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

var jwtKey = builder.Configuration["Jwt:Key"];

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey!)
            )
        };
    });


//seller service and repository
builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<ISellerService, SellerService>();

//auth
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();

//wishlist
builder.Services.AddScoped<IWishlistRepository, WishlistRepository>();
builder.Services.AddScoped<IWishlistItemRepository, WishlistItemRepository>();
builder.Services.AddScoped<IWishlistService, WishlistService>();

//show public vehicles
builder.Services.AddScoped<IPublicVehicleRepository, PublicVehicleRepository>();
builder.Services.AddScoped<IPublicVehicleService, PublicVehicleService>();

//user profile
builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
builder.Services.AddScoped<IProfileService, ProfileService>();

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

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVite",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
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
app.UseCors("AllowVite");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
//using Microsoft.AspNetCore.Authentication.JwtBearer;
//using Microsoft.IdentityModel.Tokens;
//using Bike_Link.Application.IService;
//using Bike_Link.Application.Services;
//using Bike_Link.Infrastructure.Persitence.Repository;
//using CloudinaryDotNet;
//using Npgsql;
//using System.Text;
//using Bike_Link.Domain.Models;
//using Microsoft.EntityFrameworkCore;
//using Bike_Link.Domain.IRepository;
//using Microsoft.OpenApi.Models;

//var builder = WebApplication.CreateBuilder(args);

//// Add services
//builder.Services.AddControllers();
//builder.Services.AddEndpointsApiExplorer();

//builder.Services.AddSwaggerGen(c =>
//{
//    c.SwaggerDoc("v1", new OpenApiInfo
//    {
//        Title = "BikeLink API",
//        Version = "v1",
//        Description = "API cho hệ thống BikeLink - Mua bán xe đạp",
//        Contact = new OpenApiContact
//        {
//            Name = "BikeLink Team",
//            Email = "support@bikelink.com"
//        }
//    });

//    // Cấu hình Bearer Token
//    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
//    {
//        Name = "Authorization",
//        Type = SecuritySchemeType.Http,
//        Scheme = "Bearer",
//        BearerFormat = "JWT",
//        In = ParameterLocation.Header,
//        Description = @"JWT Authorization header sử dụng Bearer scheme. 

//Nhập 'Bearer' [space] và sau đó nhập token của bạn vào ô bên dưới.

//Ví dụ: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

//**Bước thực hiện:**
//1. Đăng nhập qua endpoint /api/Auth/login
//2. Copy token từ response
//3. Nhấn nút 'Authorize' ở trên cùng
//4. Dán token vào (có thể có hoặc không có chữ 'Bearer')"
//    });

//    c.AddSecurityRequirement(new OpenApiSecurityRequirement
//    {
//        {
//            new OpenApiSecurityScheme
//            {
//                Reference = new OpenApiReference
//                {
//                    Type = ReferenceType.SecurityScheme,
//                    Id = "Bearer"
//                }
//            },
//            Array.Empty<string>()
//        }
//    });

//    // Nhóm endpoints theo tag
//    c.TagActionsBy(api => new[] { api.GroupName ?? api.ActionDescriptor.RouteValues["controller"] });
//    c.DocInclusionPredicate((name, api) => true);
//});

//builder.Services.AddSingleton<NpgsqlDataSource>(_ =>
//{
//    var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
//    return NpgsqlDataSource.Create(connStr);
//});

//builder.Services.AddDbContext<BikeLinkContext>(options =>
//{
//    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
//});

//var jwtKey = builder.Configuration["Jwt:Key"];

//builder.Services
//    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options =>
//    {
//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuer = false,
//            ValidateAudience = false,
//            ValidateLifetime = true,
//            ValidateIssuerSigningKey = true,
//            IssuerSigningKey = new SymmetricSecurityKey(
//                Encoding.UTF8.GetBytes(jwtKey!)
//            )
//        };
//    });

////seller service and repository
//builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
//builder.Services.AddScoped<ISellerService, SellerService>();

////auth
//builder.Services.AddScoped<IAuthRepository, AuthRepository>();
//builder.Services.AddScoped<IAuthService, AuthService>();

////wishlist
//builder.Services.AddScoped<IWishlistRepository, WishlistRepository>();
//builder.Services.AddScoped<IWishlistItemRepository, WishlistItemRepository>();
//builder.Services.AddScoped<IWishlistService, WishlistService>();

////show public vehicles
//builder.Services.AddScoped<IPublicVehicleRepository, PublicVehicleRepository>();
//builder.Services.AddScoped<IPublicVehicleService, PublicVehicleService>();

//// Cloudinary
//builder.Services.AddSingleton(sp =>
//{
//    var cfg = sp.GetRequiredService<IConfiguration>().GetSection("Cloudinary");
//    var acc = new Account(
//        cfg["CloudName"],
//        cfg["ApiKey"],
//        cfg["ApiSecret"]
//    );
//    return new Cloudinary(acc);
//});

//// Add CORS
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowVite",
//        policy =>
//        {
//            policy
//                .WithOrigins("http://localhost:5173")
//                .AllowAnyHeader()
//                .AllowAnyMethod();
//        });
//});

//var app = builder.Build();

//// Swagger in Development
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI(c =>
//    {
//        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BikeLink API v1");
//        c.RoutePrefix = "swagger";
//        c.DocumentTitle = "BikeLink API Documentation";
//        c.DefaultModelsExpandDepth(-1); // Ẩn schemas section
//        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None); // Thu gọn tất cả endpoints
//        c.EnableDeepLinking();
//        c.DisplayRequestDuration();
//    });
//}

//app.UseHttpsRedirection();
//app.UseCors("AllowVite");
//app.UseAuthentication();
//app.UseAuthorization();

//app.MapControllers();
//app.Run();