/*
This code sets up services related to localization, database, authentication, and HTTP requests in an ASP.NET Core application.
It configures localization for different cultures, connects to a PostgreSQL database, sets up identity management with Entity Framework, adds HTTP client services, and configures the HTTP request pipeline for routing, authentication, and authorization.
*/

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.JSInterop;
using MultiClimact.Data;

// Create a new builder for the web application
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// LOCALIZATION: "*.resx" files for each page are located in the "Resources" folder.
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

// Configure Razor Pages to use localization for views and data annotations
builder.Services.AddRazorPages()
    .AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix)
    .AddDataAnnotationsLocalization();

// DATABASE
// Get the connection string for the PostgreSQL database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
// Add ApplicationDbContext to the service container and configure it to use PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
// Add a filter to catch database-related exceptions in development mode
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

// AUTHENTICATION
// Add default identity with IdentityUser and configure options
builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = false)
    .AddEntityFrameworkStores<ApplicationDbContext>();

// Add HttpClient services
builder.Services.AddHttpClient();

builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromSeconds(10);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// Build the application
var app = builder.Build();

// Set up supported cultures for localization
var supportedCultures = new[] { "en", "it" };
var localizationOptions = new RequestLocalizationOptions().SetDefaultCulture(supportedCultures[0])
    .AddSupportedCultures(supportedCultures)
    .AddSupportedUICultures(supportedCultures);

// Configure request localization
app.UseRequestLocalization(localizationOptions);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Enable the Migrations page endpoint in development mode
    app.UseMigrationsEndPoint();
}
else
{
    // Use exception handling middleware and HTTP Strict Transport Security (HSTS) in non-development environments
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios.
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

app.UseSession();

// Map Razor Pages routes
app.MapRazorPages();

// Run the application
app.Run();
