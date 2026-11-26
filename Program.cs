namespace ZaloDesk;

internal static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        var background = args.Contains("--background", StringComparer.OrdinalIgnoreCase);
        using var mutex = new Mutex(true, "Local\\ZaloDesk", out var first);
        if (!first) { if (!background) MessageBox.Show("ZaloDesk đang chạy. Mở ứng dụng từ khay hệ thống."); return; }
        ApplicationConfiguration.Initialize();
        Application.Run(new MainForm(background));
    }
}
