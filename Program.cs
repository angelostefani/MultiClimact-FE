/*
* Author: Angelo Stefani [angelo.stefani@enea.it]
* Creation date: 02/01/2024
* Update date: 05/15/2024
* This code sets up services related to localization, database, authentication, and HTTP requests in an ASP.NET Core application.
* It configures localization for different cultures, connects to a PostgreSQL database, sets up identity management with Entity Framework, adds HTTP client services, and configures the HTTP request pipeline for routing, authentication, and authorization.
*/

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.JSInterop;
using MultiClimact.Data;
using MultiClimact.Services;

// Create a new builder for the web application
var builder = WebApplication.CreateBuilder(args);

// Add services to the container

// LOCALIZATION: Configure localization options and resource path
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

// Configure Razor Pages to use localization for views and data annotations
builder.Services.AddRazorPages()
    .AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix)
    .AddDataAnnotationsLocalization();

// Add support for controllers
builder.Services.AddControllers();

// DATABASE: Configure Entity Framework to use a database provider based on configuration
var databaseProvider = builder.Configuration["DatabaseProvider"] ?? "Sqlite"; // "Sqlite" or "PostgreSQL"
if (databaseProvider.Equals("PostgreSQL", StringComparison.OrdinalIgnoreCase))
{
    var pgConnection = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(pgConnection))
        throw new InvalidOperationException("Connection string 'DefaultConnection' (PostgreSQL) is missing. Configure via user-secrets or environment.");
    builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(pgConnection));
}
else
{
    var sqliteConnection = builder.Configuration.GetConnectionString("SqliteConnection")
        ?? builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(sqliteConnection))
        throw new InvalidOperationException("SQLite connection string is missing. Set 'ConnectionStrings:SqliteConnection' or 'DefaultConnection'.");
    builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlite(sqliteConnection));
}
// Add a filter to catch database-related exceptions in development mode
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

// AUTHENTICATION: Set up default identity management with Entity Framework
builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = false)
    .AddEntityFrameworkStores<ApplicationDbContext>();

// Add HttpClient services
builder.Services.AddHttpClient();
builder.Services.AddTransient<RetryHandler>();

// Configure typed HTTP clients for external services
builder.Services.AddHttpClient<EarthquakeServiceClient>(client =>
{
    var baseUrl = builder.Configuration["EarthquakeService:BaseUrl"];
    if (!string.IsNullOrEmpty(baseUrl))
        client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
})
    .AddHttpMessageHandler<RetryHandler>();

builder.Services.AddHttpClient<HeatwaveServiceClient>(client =>
{
    var baseUrl = builder.Configuration["HeatwaveService:BaseUrl"];
    if (!string.IsNullOrEmpty(baseUrl))
        client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
})
    .AddHttpMessageHandler<RetryHandler>();

// Default named client for internal calls
builder.Services.AddHttpClient("Default", client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
})
    .AddHttpMessageHandler<RetryHandler>();

// Add distributed memory cache for session state
builder.Services.AddDistributedMemoryCache();

// Configure session state with a timeout and essential cookie settings
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// Build the application
var app = builder.Build();

// Configure supported cultures for localization
var supportedCultures = new[] { "en", "it" };
var localizationOptions = new RequestLocalizationOptions().SetDefaultCulture(supportedCultures[0])
    .AddSupportedCultures(supportedCultures)
    .AddSupportedUICultures(supportedCultures);

// Apply request localization configuration
app.UseRequestLocalization(localizationOptions);

// Configure the HTTP request pipeline

if (app.Environment.IsDevelopment())
{
    // Enable the migrations page endpoint in development mode
    app.UseMigrationsEndPoint();
}
else
{
    // Use exception handling middleware and HTTP Strict Transport Security (HSTS) in non-development environments
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// Redirect HTTP requests to HTTPS
app.UseHttpsRedirection();
// Serve static files (e.g., HTML, CSS, JavaScript)
app.UseStaticFiles();

// Enable routing
app.UseRouting();

// Enable authentication
app.UseAuthentication();

// Enable authorization
app.UseAuthorization();

// Enable session state
app.UseSession();

// Map Razor Pages routes
app.MapRazorPages();

// Map Controller routes for API endpoints
app.MapControllers();

// On first run with SQLite in dev, ensure DB is created (avoid migrations overhead for local dev)
if ((builder.Configuration["DatabaseProvider"] ?? "Sqlite").Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();
}

// Run the application
app.Run();
