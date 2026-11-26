using System.Diagnostics;

namespace ZaloDesk;

public sealed class MainForm : Form
{
    private readonly Label status = new() { Text = "Đang kết nối…", Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleLeft, AutoEllipsis = true, Margin = Padding.Empty };
    private readonly Label statusDot = new() { Text = "●", Width = 18, Dock = DockStyle.Left, TextAlign = ContentAlignment.MiddleLeft, ForeColor = Color.Gray };
    private readonly Button launch = new() { Text = "Kết nối Zalo", Dock = DockStyle.Fill, FlatStyle = FlatStyle.Flat, BackColor = Color.FromArgb(0, 104, 255), ForeColor = Color.White, UseVisualStyleBackColor = false, Margin = new Padding(0, 0, 8, 0), Cursor = Cursors.Hand };
    private readonly ToolTip statusTip = new();
    private readonly Icon appIcon;
    private readonly CancellationTokenSource stop = new();
    private readonly NotifyIcon tray;
    private readonly ZaloConnection connection = new();
    private bool startInTray;
    private bool connectionStarted;
    private bool quitting;
    private bool checkingUpdate;
    private readonly System.Windows.Forms.Timer updateTimer = new() { Interval = 24 * 60 * 60 * 1000 };

    public MainForm(bool startInTray = false)
    {
        this.startInTray = startInTray;
        using (var iconStream = typeof(MainForm).Assembly.GetManifestResourceStream("ZaloDesk.AppIcon")!)
        using (var sourceIcon = new Icon(iconStream, new Size(32, 32))) appIcon = (Icon)sourceIcon.Clone();
        Icon = appIcon;
        Text = "ZaloDesk " + AppUpdate.Current.ToString(3); ClientSize = new Size(360, 290);
        FormBorderStyle = FormBorderStyle.FixedSingle; MaximizeBox = false;
        StartPosition = FormStartPosition.CenterScreen; Font = new Font("Segoe UI", 10);
        Padding = new Padding(18); BackColor = Color.White; ForeColor = Color.FromArgb(32, 39, 48);
        var layout = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 7, Margin = Padding.Empty, Padding = Padding.Empty };
        layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        foreach (var height in new[] { 32, 32, 42, 30, 34, 32 }) layout.RowStyles.Add(new RowStyle(SizeType.Absolute, height));
        layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        var title = new Label { Text = "ZaloDesk", Font = new Font("Segoe UI", 16, FontStyle.Bold), Dock = DockStyle.Fill, Margin = Padding.Empty };
        var statusRow = new Panel { Dock = DockStyle.Fill, Margin = Padding.Empty };
        statusRow.Controls.Add(status); statusRow.Controls.Add(statusDot);
        var help = new Label { Text = "Mở tiện ích từ icon ZaloDesk\ntrên thanh bên của Zalo.", Dock = DockStyle.Fill, Font = new Font("Segoe UI", 9), ForeColor = Color.FromArgb(104, 113, 126), Margin = Padding.Empty };
        var buttons = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 2, RowCount = 1, Margin = Padding.Empty };
        buttons.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 54)); buttons.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 46));
        launch.FlatAppearance.BorderSize = 0;
        var minimize = new Button { Text = "Thu gọn", Dock = DockStyle.Fill, FlatStyle = FlatStyle.Flat, BackColor = Color.FromArgb(243, 245, 248), UseVisualStyleBackColor = false, Margin = Padding.Empty, Cursor = Cursors.Hand };
        minimize.FlatAppearance.BorderSize = 0; minimize.Click += (_, _) => Hide();
        buttons.Controls.Add(launch, 0, 0); buttons.Controls.Add(minimize, 1, 0);
        var footer = new Label { Text = "© 2026 HAVY\nỨng dụng tiếp tục chạy ở khay hệ thống.", Dock = DockStyle.Fill, TextAlign = ContentAlignment.BottomLeft, Font = new Font("Segoe UI", 8), ForeColor = Color.FromArgb(133, 141, 152), Margin = Padding.Empty };
        var startup = new CheckBox { Text = "Khởi động cùng Windows", Dock = DockStyle.Fill, Margin = Padding.Empty, Font = new Font("Segoe UI", 9), Cursor = Cursors.Hand };
        try { startup.Checked = StartupRegistration.IsEnabled(); }
        catch (Exception ex) { startup.Enabled = false; statusTip.SetToolTip(startup, ex.Message); }
        var updatingStartup = false;
        startup.CheckedChanged += (_, _) => {
            if (updatingStartup) return;
            try { StartupRegistration.SetEnabled(startup.Checked); }
            catch (Exception ex) {
                updatingStartup = true; startup.Checked = !startup.Checked; updatingStartup = false;
                MessageBox.Show(this, "Không lưu được cài đặt khởi động: " + ex.Message, "ZaloDesk", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        };
        statusTip.SetToolTip(startup, "Tự chạy ở khay hệ thống sau khi đăng nhập Windows.");
        var update = new Button { Text = "Kiểm tra cập nhật", Dock = DockStyle.Fill, Margin = new Padding(0, 4, 0, 0), Cursor = Cursors.Hand };
        update.Click += async (_, _) => await CheckUpdate(false);
        layout.Controls.Add(title, 0, 0); layout.Controls.Add(statusRow, 0, 1); layout.Controls.Add(help, 0, 2); layout.Controls.Add(startup, 0, 3); layout.Controls.Add(buttons, 0, 4); layout.Controls.Add(update, 0, 5); layout.Controls.Add(footer, 0, 6);
        Controls.Add(layout);
        var menu = new ContextMenuStrip { ShowImageMargin = true, ImageScalingSize = new Size(16, 16) };
        Bitmap openImage;
        using (var stream = typeof(MainForm).Assembly.GetManifestResourceStream("ZaloDesk.AppIcon")!)
        using (var icon = new Icon(stream, new Size(16, 16))) openImage = icon.ToBitmap();
        var exitImage = CreateExitMenuImage();
        menu.Items.Add("Mở ZaloDesk", openImage, (_, _) => Restore());
        menu.Items.Add("Kiểm tra cập nhật", null, async (_, _) => await CheckUpdate(false));
        menu.Items.Add("Thoát", exitImage, (_, _) => { quitting = true; Close(); });
        tray = new NotifyIcon { Text = "ZaloDesk", Icon = appIcon, Visible = true, ContextMenuStrip = menu };
        tray.DoubleClick += (_, _) => Restore();
        launch.Click += LaunchZalo;
        Shown += (_, _) => StartConnection();
        FormClosing += (_, e) => {
            if (!quitting && e.CloseReason == CloseReason.UserClosing) { e.Cancel = true; Hide(); return; }
            updateTimer.Dispose(); stop.Cancel(); tray.Visible = false; tray.Dispose(); statusTip.Dispose();
        };
        Disposed += (_, _) => { menu.Dispose(); openImage.Dispose(); exitImage.Dispose(); appIcon.Dispose(); };
    }

    protected override void SetVisibleCore(bool value)
    {
        if (startInTray && value)
        {
            startInTray = false;
            if (!IsHandleCreated) CreateHandle();
            BeginInvoke(new Action(StartConnection));
            value = false;
        }
        base.SetVisibleCore(value);
    }

    private async void StartConnection()
    {
        if (connectionStarted) return;
        connectionStarted = true;
        updateTimer.Tick += async (_, _) => await CheckUpdate(true);
        updateTimer.Start();
        _ = CheckUpdate(true);
        await connection.RunAsync(UpdateStatus, stop.Token);
    }

    private async Task CheckUpdate(bool silent)
    {
        if (checkingUpdate || quitting) return;
        checkingUpdate = true;
        try
        {
            if (await AppUpdate.CheckAsync(this, silent, stop.Token)) { quitting = true; Close(); }
        }
        catch (OperationCanceledException) when (stop.IsCancellationRequested) { }
        catch (Exception ex)
        {
            if (!silent && !IsDisposed) MessageBox.Show(this, "Không kiểm tra/cập nhật được: " + ex.Message, "ZaloDesk", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
        finally { checkingUpdate = false; }
    }

    private static Bitmap CreateExitMenuImage()
    {
        using var large = new Bitmap(64, 64);
        using (var graphics = Graphics.FromImage(large))
        {
            graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            graphics.ScaleTransform(4, 4);
            using var pen = new Pen(Color.FromArgb(100, 110, 124), 1.6f)
            {
                StartCap = System.Drawing.Drawing2D.LineCap.Round,
                EndCap = System.Drawing.Drawing2D.LineCap.Round,
                LineJoin = System.Drawing.Drawing2D.LineJoin.Round
            };
            graphics.DrawLines(pen, [new PointF(6, 3), new PointF(2.5f, 3), new PointF(2.5f, 13), new PointF(6, 13)]);
            graphics.DrawLine(pen, 6, 8, 14, 8);
            graphics.DrawLines(pen, [new PointF(11, 5), new PointF(14, 8), new PointF(11, 11)]);
        }
        return new Bitmap(large, new Size(16, 16));
    }

    private void Restore() { Show(); WindowState = FormWindowState.Normal; Activate(); }
    private void UpdateStatus(string text)
    {
        if (IsDisposed || Disposing) return;
        var connected = text.StartsWith("Đã kết nối", StringComparison.Ordinal);
        status.Text = connected ? "Đã kết nối với Zalo" :
            text.StartsWith("Chưa kết nối", StringComparison.Ordinal) ? "Chưa kết nối với Zalo" :
            text.StartsWith("Đang thử", StringComparison.Ordinal) ? "Đang kết nối lại…" : text;
        statusDot.ForeColor = connected ? Color.FromArgb(29, 153, 95) : Color.FromArgb(147, 157, 171);
        statusTip.SetToolTip(status, text);
    }

    private async void LaunchZalo(object? sender, EventArgs e)
    {
        launch.Enabled = false;
        try
        {
            var running = Process.GetProcessesByName("Zalo");
            var path = running.Select(p => { try { return p.MainModule?.FileName; } catch { return null; } }).FirstOrDefault(p => p != null)
                ?? FindZalo();
            if (path == null) { MessageBox.Show(this, "Không tìm thấy Zalo PC. Hãy cài Zalo rồi thử lại."); return; }
            if (running.Length > 0)
            {
                if (MessageBox.Show(this, "Cần mở lại Zalo để bật kết nối tiện ích. Cuộc gọi đang diễn ra có thể bị ngắt.\n\nMở lại Zalo ngay?", "Kết nối ZaloDesk", MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes) return;
                // Request normal shutdown before offering force-close; never kill silently.
                foreach (var process in running) { try { process.CloseMainWindow(); } catch { } }
                await Task.Delay(2500);
                var remaining = Process.GetProcessesByName("Zalo");
                if (remaining.Length > 0)
                {
                    if (MessageBox.Show(this, "Zalo vẫn đang chạy nền. Đóng các tiến trình Zalo để mở lại?", "Zalo còn chạy", MessageBoxButtons.YesNo) != DialogResult.Yes) return;
                    foreach (var process in remaining) { try { process.Kill(true); await process.WaitForExitAsync(); } catch (InvalidOperationException) { } }
                }
            }
            Process.Start(new ProcessStartInfo(path, "--remote-debugging-address=127.0.0.1 --remote-debugging-port=8315") { UseShellExecute = true });
            UpdateStatus("Đang mở Zalo, chờ giao diện sẵn sàng…");
        }
        catch (Exception ex) { MessageBox.Show(this, ex.Message, "Không mở được Zalo"); }
        finally { launch.Enabled = true; }
    }

    private static string? FindZalo()
    {
        var root = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "Zalo");
        if (!Directory.Exists(root)) return null;
        var launcher = Path.Combine(root, "Zalo.exe");
        return File.Exists(launcher) ? launcher : Directory.EnumerateFiles(root, "Zalo.exe", SearchOption.AllDirectories).OrderByDescending(File.GetLastWriteTimeUtc).FirstOrDefault();
    }
}
