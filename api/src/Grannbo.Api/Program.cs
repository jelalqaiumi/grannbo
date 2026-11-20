using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSerilog((services, lc) => lc
    .ReadFrom.Configuration(builder.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext());

builder.Services.AddProblemDetails(options => options.CustomizeProblemDetails = context =>
{
    if (context.ProblemDetails.Status == StatusCodes.Status404NotFound)
    {
        context.ProblemDetails.Title = ProblemTexts.NotFoundTitle;
    }
    else if (context.ProblemDetails.Status == StatusCodes.Status500InternalServerError)
    {
        context.ProblemDetails.Title = ProblemTexts.InternalServerErrorTitle;
    }
});

builder.Services.AddHealthChecks();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseSerilogRequestLogging();
app.MapHealthChecks("/health");

app.Run();
