using System.Net;
using Xunit;

namespace Grannbo.Api.Tests;

public sealed class HealthEndpointTests(GrannboApiFactory factory) : IClassFixture<GrannboApiFactory>
{
    [Fact]
    public async Task Get_health_returns_200_text_plain_Healthy()
    {
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/health", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/plain", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal("Healthy", await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }
}
