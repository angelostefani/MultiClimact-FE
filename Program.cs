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

// DATABASE: Configure Entity Framework to use a PostgreSQL database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
// Add a filter to catch database-related exceptions in development mode
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

// AUTHENTICATION: Set up default identity management with Entity Framework
builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = false)
    .AddEntityFrameworkStores<ApplicationDbContext>();

// Add HttpClient services
builder.Services.AddHttpClient();

// Add distributed memory cache for session state
builder.Services.AddDistributedMemoryCache();

// Configure session state with a timeout and essential cookie settings
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromSeconds(10);
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

// Run the application
app.Run();
