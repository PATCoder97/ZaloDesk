using System.Diagnostics;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace ZaloDesk;

internal static class AppUpdate
{
    internal static Version Current => Assembly.GetExecutingAssembly().GetName().Version!;
    private static readonly HttpClient Http = CreateClient();
    private static HttpClient CreateClient()
    {
        var client = new HttpClient { Timeout = TimeSpan.FromMinutes(5) };
        client.DefaultRequestHeaders.UserAgent.ParseAdd("ZaloDesk/" + Current);
        return client;
    }

    internal static async Task<bool> CheckAsync(Form owner, bool silent, CancellationToken token)
    {
        using var response = await Http.GetAsync("https://api.github.com/repos/PATCoder97/ZaloDesk/releases/latest", token);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            if (!silent) MessageBox.Show(owner, "Chưa có bản phát hành để cập nhật.", "ZaloDesk");
            return false;
        }
        response.EnsureSuccessStatusCode();
        using var release = JsonDocument.Parse(await response.Content.ReadAsStringAsync(token));
        var root = release.RootElement;
        if (!Version.TryParse(root.GetProperty("tag_name").GetString()?.TrimStart('v'), out var latest))
            throw new IOException("Phiên bản phát hành không hợp lệ.");
        if (latest <= Current)
        {
            if (!silent) MessageBox.Show(owner, $"Bạn đang dùng bản mới nhất ({Current.ToString(3)}).", "ZaloDesk");
            return false;
        }
        if (MessageBox.Show(owner, $"Có ZaloDesk {latest.ToString(3)}. Tải và khởi động lại để cập nhật?", "Cập nhật ZaloDesk", MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes) return false;
        var assets = root.GetProperty("assets").EnumerateArray().ToArray();
        string AssetUrl(string name)
        {
            var asset = assets.FirstOrDefault(a => a.GetProperty("name").GetString() == name);
            if (asset.ValueKind == JsonValueKind.Undefined) throw new IOException("Bản phát hành thiếu " + name);
            var uri = new Uri(asset.GetProperty("browser_download_url").GetString()!);
            if (uri.Scheme != "https" || uri.Host != "github.com" || !uri.AbsolutePath.StartsWith("/PATCoder97/ZaloDesk/releases/download/", StringComparison.Ordinal)) throw new IOException("Địa chỉ tải không hợp lệ.");
            return uri.AbsoluteUri;
        }
        var expected = (await Http.GetStringAsync(AssetUrl("ZaloDesk.exe.sha256"), token)).Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)[0];
        var directory = Path.Combine(Path.GetTempPath(), "ZaloDesk-update-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(directory);
        var download = Path.Combine(directory, "ZaloDesk.exe");
        try
        {
            using (var input = await Http.GetStreamAsync(AssetUrl("ZaloDesk.exe"), token))
            await using (var output = File.Create(download)) await input.CopyToAsync(output, token);
            await using (var file = File.OpenRead(download))
            {
                var actual = Convert.ToHexString(await SHA256.HashDataAsync(file, token));
                if (!actual.Equals(expected, StringComparison.OrdinalIgnoreCase)) throw new IOException("File tải về không khớp SHA-256. Hãy thử lại.");
            }
            var target = Environment.ProcessPath ?? throw new IOException("Không tìm thấy đường dẫn ứng dụng.");
            if (!FileVersionInfo.GetVersionInfo(download).ProductVersion!.StartsWith(latest.ToString(3), StringComparison.Ordinal)) throw new IOException("Phiên bản file tải về không hợp lệ.");
            StartInstaller(download, target);
            return true;
        }
        catch { Directory.Delete(directory, true); throw; }
    }

    private static void StartInstaller(string source, string target)
    {
        static string Quote(string value) => "'" + value.Replace("'", "''") + "'";
        var script = $$"""
            $ErrorActionPreference = 'Stop'
            $target = {{Quote(target)}}
            $source = {{Quote(source)}}
            $backup = $target + '.previous'
            $staged = $target + '.update-' + [Guid]::NewGuid().ToString('N')
            try {
                $app = Get-Process -Id {{Environment.ProcessId}} -ErrorAction SilentlyContinue
                if ($app -and !$app.WaitForExit(60000)) { throw 'Ứng dụng chưa thoát.' }
                [IO.File]::Copy($source, $staged, $false)
                $installed = $false
                for ($attempt = 0; $attempt -lt 20; $attempt++) {
                    try {
                        [IO.File]::Replace($staged, $target, $backup, $true)
                        $installed = $true
                        break
                    } catch { Start-Sleep -Milliseconds 500 }
                }
                if (!$installed) { throw 'Không thay được file ứng dụng. Bản cũ được giữ nguyên.' }
                try { Start-Process -FilePath $target -WorkingDirectory (Split-Path -LiteralPath $target) }
                catch { [IO.File]::Copy($backup, $target, $true); throw }
            } catch {
                Add-Type -AssemblyName System.Windows.Forms
                [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'Không cập nhật được ZaloDesk')
            } finally {
                Remove-Item -LiteralPath $staged -Force -ErrorAction SilentlyContinue
                Remove-Item -LiteralPath $source -Force -ErrorAction SilentlyContinue
            }
            """;
        var info = new ProcessStartInfo("powershell.exe") { UseShellExecute = false, CreateNoWindow = true };
        foreach (var arg in new[] { "-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-EncodedCommand", Convert.ToBase64String(Encoding.Unicode.GetBytes(script)) }) info.ArgumentList.Add(arg);
        Process.Start(info)?.Dispose();
    }
}
