using System.Xml.Linq;
using Xunit;

namespace Grannbo.Api.Tests;

public sealed class ProjectReferenceTests
{
    private static readonly Dictionary<string, string[]> AllowedReferences = new()
    {
        ["Grannbo.Domain"] = [],
        ["Grannbo.Application"] = ["Grannbo.Domain"],
        ["Grannbo.Infrastructure"] = ["Grannbo.Application", "Grannbo.Domain"],
        ["Grannbo.Api"] = ["Grannbo.Application", "Grannbo.Infrastructure"],
    };

    [Fact]
    public void Every_project_under_src_is_in_the_reference_table()
    {
        var projects = SrcProjectFiles().Select(Path.GetFileNameWithoutExtension).Order(StringComparer.Ordinal).ToArray();

        Assert.Equal(AllowedReferences.Keys.Order(StringComparer.Ordinal).ToArray(), projects);
    }

    [Fact]
    public void Project_references_match_the_table_exactly()
    {
        foreach (var file in SrcProjectFiles())
        {
            var project = Path.GetFileNameWithoutExtension(file);
            var actual = Items(file, "ProjectReference")
                .Select(include => Path.GetFileNameWithoutExtension(include.Replace('\\', '/')))
                .Order(StringComparer.Ordinal)
                .ToArray();

            Assert.True(AllowedReferences.TryGetValue(project, out var allowed), $"{project} saknas i tabellen.");
            Assert.Equal(allowed.Order(StringComparer.Ordinal).ToArray(), actual);
        }
    }

    [Fact]
    public void Domain_has_no_package_or_framework_references()
    {
        var domain = SrcProjectFiles().Single(f => Path.GetFileNameWithoutExtension(f) == "Grannbo.Domain");

        Assert.Empty(Items(domain, "PackageReference"));
        Assert.Empty(Items(domain, "FrameworkReference"));
    }

    private static string[] Items(string projectFile, string itemName) =>
        XDocument.Load(projectFile)
            .Descendants(itemName)
            .Select(e => (string?)e.Attribute("Include") ?? (string?)e.Attribute("Update") ?? string.Empty)
            .ToArray();

    private static string[] SrcProjectFiles() =>
        Directory.GetFiles(
            Path.Combine(SolutionDirectory(), "src"),
            "*.csproj",
            new EnumerationOptions { RecurseSubdirectories = true, AttributesToSkip = FileAttributes.ReparsePoint });

    private static string SolutionDirectory()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Grannbo.slnx")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new InvalidOperationException("Hittade inte Grannbo.slnx ovanför testkatalogen.");
    }
}
