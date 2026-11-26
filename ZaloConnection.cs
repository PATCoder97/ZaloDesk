using System.Net.WebSockets;
using System.Reflection;
using System.Text;
using System.Text.Json;

namespace ZaloDesk;

internal sealed class ZaloConnection
{
    private readonly HttpClient http = new(new HttpClientHandler { UseProxy = false }) { Timeout = TimeSpan.FromSeconds(2) };
    private readonly string script;
    private readonly HashSet<string> registered = [];
    private int sequence;

    public ZaloConnection()
    {
        using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("ZaloDesk.Assets.sidebar.js")!;
        using var reader = new StreamReader(stream, new UTF8Encoding(false, true)); script = reader.ReadToEnd();
    }

    public async Task RunAsync(Action<string> report, CancellationToken token)
    {
        while (!token.IsCancellationRequested)
        {
            try
            {
                using var targets = JsonDocument.Parse(await http.GetStringAsync("http://127.0.0.1:8315/json", token));
                bool mounted = false, found = false;
                var live = new HashSet<string>();
                foreach (var target in targets.RootElement.EnumerateArray())
                {
                    if (target.GetProperty("type").GetString() != "page" || !target.TryGetProperty("webSocketDebuggerUrl", out var address)) continue;
                    var pageUrl = target.GetProperty("url").GetString() ?? "";
                    if (!pageUrl.Contains("/pc-dist/index.html", StringComparison.OrdinalIgnoreCase) &&
                        !pageUrl.StartsWith("https://chat.zalo.me/", StringComparison.OrdinalIgnoreCase)) continue;
                    // The endpoint is Zalo's dedicated local debug port; renderer pages can use file:// URLs.
                    var uri = new Uri(address.GetString()!);
                    if (!uri.IsLoopback || uri.Port != 8315 || uri.Scheme != "ws") continue;
                    found = true;
                    var id = target.GetProperty("id").GetString()!; live.Add(id);
                    using var timeout = CancellationTokenSource.CreateLinkedTokenSource(token);
                    timeout.CancelAfter(TimeSpan.FromSeconds(6));
                    using var socket = new ClientWebSocket();
                    socket.Options.Proxy = null;
                    await socket.ConnectAsync(uri, timeout.Token);
                    if (!registered.Contains(id))
                    {
                        await Command(socket, "Page.addScriptToEvaluateOnNewDocument", new { source = script }, timeout.Token);
                        registered.Add(id);
                    }
                    var result = await Command(socket, "Runtime.evaluate", new { expression = script, returnByValue = true }, timeout.Token);
                    if (result.TryGetProperty("exceptionDetails", out _)) throw new InvalidOperationException("Không chèn được giao diện ZaloDesk.");
                    mounted |= result.GetProperty("result").TryGetProperty("value", out var value) && value.GetString() == "mounted";
                }
                registered.IntersectWith(live);
                report(mounted ? "Đã kết nối • Icon ZaloDesk đã có trên thanh bên Zalo." : found ? "Đã kết nối • Đang chờ thanh bên Zalo (hãy đăng nhập nếu cần)." : "Đang chờ cửa sổ Zalo…");
            }
            catch (OperationCanceledException) when (token.IsCancellationRequested) { break; }
            catch (Exception ex)
            {
                registered.Clear();
                report(ex is HttpRequestException or TaskCanceledException ? "Chưa kết nối. Bấm “Mở / kết nối lại Zalo” để bật tiện ích." : "Đang thử kết nối lại: " + ex.Message);
            }
            try { await Task.Delay(4000, token); } catch (OperationCanceledException) { break; }
        }
        http.Dispose();
    }

    private async Task<JsonElement> Command(ClientWebSocket socket, string method, object args, CancellationToken token)
    {
        var id = ++sequence;
        var data = JsonSerializer.SerializeToUtf8Bytes(new { id, method, @params = args });
        await socket.SendAsync(data.AsMemory(), WebSocketMessageType.Text, true, token);
        var buffer = new byte[16384];
        while (true)
        {
            using var message = new MemoryStream();
            ValueWebSocketReceiveResult part;
            do
            {
                part = await socket.ReceiveAsync(buffer.AsMemory(), token);
                if (part.MessageType == WebSocketMessageType.Close) throw new IOException("Zalo đã đóng kết nối.");
                message.Write(buffer, 0, part.Count);
                if (message.Length > 4 * 1024 * 1024) throw new IOException("Phản hồi debug quá lớn.");
            } while (!part.EndOfMessage);
            using var json = JsonDocument.Parse(message.ToArray());
            if (!json.RootElement.TryGetProperty("id", out var responseId) || responseId.GetInt32() != id) continue;
            if (json.RootElement.TryGetProperty("error", out var error)) throw new IOException(error.ToString());
            return json.RootElement.GetProperty("result").Clone();
        }
    }
}
