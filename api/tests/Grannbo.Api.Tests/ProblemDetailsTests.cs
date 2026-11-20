using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace Grannbo.Api.Tests;

public sealed class ProblemDetailsTests(GrannboApiFactory factory) : IClassFixture<GrannboApiFactory>
{
    [Fact]
    public async Task Unknown_path_returns_404_problem_with_swedish_title()
    {
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/finns-inte", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        Assert.Equal(404, body.RootElement.GetProperty("status").GetInt32());
        Assert.Equal("Det du sökte finns inte.", body.RootElement.GetProperty("title").GetString());
    }

    [Fact]
    public async Task Unhandled_exception_returns_500_problem_with_swedish_title_and_no_exception_details()
    {
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/__test/throw", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var text = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        using var body = JsonDocument.Parse(text);
        Assert.Equal(500, body.RootElement.GetProperty("status").GetInt32());
        Assert.Equal("Ett oväntat fel inträffade. Försök igen senare.", body.RootElement.GetProperty("title").GetString());
        Assert.DoesNotContain("testundantag-hemligt", text, StringComparison.Ordinal);
        Assert.DoesNotContain("InvalidOperationException", text, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData(null)]
    [InlineData(400)]
    [InlineData(403)]
    [InlineData(405)]
    [InlineData(499)]
    [InlineData(501)]
    [InlineData(503)]
    public void Other_status_codes_keep_their_title(int? status)
    {
        var options = factory.Services.GetRequiredService<IOptions<ProblemDetailsOptions>>().Value;
        var context = new ProblemDetailsContext
        {
            HttpContext = new DefaultHttpContext(),
            ProblemDetails = new ProblemDetails { Status = status, Title = "Orörd titel" },
        };

        Assert.NotNull(options.CustomizeProblemDetails);
        options.CustomizeProblemDetails(context);

        Assert.Equal("Orörd titel", context.ProblemDetails.Title);
    }
}
