$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
$runPath = 'Software\Microsoft\Windows\CurrentVersion\Run'
$key = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($runPath)
$previous = $key.GetValue('ZaloDesk', $null)
$previousKind = if ($null -ne $previous) { $key.GetValueKind('ZaloDesk') } else { $null }
try {
    $zdWindow = [IntPtr]::Zero
    for ($attempt = 0; $attempt -lt 100; $attempt++) {
        $zdApp = Get-Process ZaloDesk | Select-Object -First 1
        $zdWindow = $zdApp.MainWindowHandle
        if ($zdWindow -ne [IntPtr]::Zero) { break }
        Start-Sleep -Milliseconds 200
    }
    if ($zdWindow -eq [IntPtr]::Zero) { throw 'Open the ZaloDesk window before testing.' }
    $root = [System.Windows.Automation.AutomationElement]::FromHandle($zdWindow)
    $condition = [System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::ControlTypeProperty, [System.Windows.Automation.ControlType]::CheckBox)
    $checkbox = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $condition)
    if ($null -eq $checkbox) { throw 'Startup checkbox missing.' }
    $toggle = $checkbox.GetCurrentPattern([System.Windows.Automation.TogglePattern]::Pattern)
    if ($toggle.Current.ToggleState -eq [System.Windows.Automation.ToggleState]::On) { $toggle.Toggle() }
    $toggle.Toggle()
    Start-Sleep -Milliseconds 200
    $expected = '"' + $zdApp.Path + '" --background'
    if ($key.GetValue('ZaloDesk') -ne $expected) { throw 'Incorrect startup command.' }
    Write-Output 'PASS: checkbox registers quoted EXE path with --background.'
    $toggle.Toggle()
    Start-Sleep -Milliseconds 200
    if ($null -ne $key.GetValue('ZaloDesk', $null)) { throw 'Startup value was not removed.' }
    Write-Output 'PASS: checkbox removes only the ZaloDesk startup entry.'
    if ($null -ne $previous -and $previous -eq $expected) { $toggle.Toggle() }
} finally {
    if ($null -eq $previous) { $key.DeleteValue('ZaloDesk', $false) }
    else { $key.SetValue('ZaloDesk', $previous, $previousKind) }
    $key.Dispose()
}
