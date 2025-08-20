# Cursor Reveal Explorer

A VS Code extension that adds a "Reveal in Explorer" button for remote connections (like WSL) in Cursor IDE and other VS Code-based editors. Cursor IDE doesn't include this button when using remote connections, so this extension fills that gap. Perfect for WSL users who need to quickly open files in Windows File Explorer.

<img width="421" height="117" alt="image" src="https://github.com/user-attachments/assets/e8a56a16-23b0-44eb-9b25-b51c625fcb4e" />



## What This Extension Does

This extension solves a common problem: Cursor IDE and other VS Code-based editors don't include the "Reveal in Explorer" button when using remote connections (like WSL). This extension brings back this essential feature, making it easy to quickly open files in Windows File Explorer from remote environments.

## Features

- 🗂️ **Reveal in Explorer**: Right-click any file and select "Reveal in Explorer" to open it in Windows File Explorer
- 🎯 **Context Menu Integration**: Available in file explorer, editor context menu, and editor tab context menu
- 🖥️ **WSL Support**: Works seamlessly in WSL environments by converting Linux paths to Windows paths
- ⚡ **Command Palette**: Access via Command Palette with "Reveal in Explorer"
- 📁 **File Highlighting**: Opens Explorer with the specific file selected/highlighted



## Usage

### Right-click Context Menu
1. Right-click on any file in the Explorer panel, editor, or editor tab
2. Select "Reveal in Explorer" from the context menu
3. Windows File Explorer will open with the file highlighted

### Command Palette
1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Reveal in Explorer"
3. Press Enter to reveal the currently active file

## WSL Setup

### Activate WSL Interop (Required for Linux/WSL2)

**Important**: For this extension to work properly on WSL2, you need to activate Windows Subsystem for Linux interoperability. This allows WSL to launch Windows applications like File Explorer.

```bash
# In your WSL2 terminal, run this command to check if interop is enabled:
ls /mnt/c

# If you get "Permission denied" or similar errors, interop is disabled
# To enable it, add this to your WSL configuration file:
echo '[interop]' | sudo tee -a /etc/wsl.conf
echo 'enabled = true' | sudo tee -a /etc/wsl.conf
echo 'appendWindowsPath = true' | sudo tee -a /etc/wsl.conf

# Then restart WSL from Windows PowerShell (as Administrator):
# wsl --shutdown
# wsl
```

### Configure Drive Letter Mapping

For WSL users, you need to configure the extension to know which Windows drive letter your WSL filesystem is mounted to:


<img width="885" height="709" alt="image" src="https://github.com/user-attachments/assets/fc24548b-ab2f-4f0c-9184-550f3ca7bf09" />
<img width="289" height="106" alt="image" src="https://github.com/user-attachments/assets/653292cd-dba6-46e4-bfa3-1c984a942245" />

1. **Default setting**: The extension uses `Z:` as the default mount drive
2. **To change this**: 
   - Open VS Code Settings (`Ctrl+,`)
   - Search for "Cursor Reveal Explorer"
   - Set "Wsl Mount Drive" to your preferred drive letter (e.g., `Y:`, `W:`)

## Supported Platforms

- ✅ **Windows**: Native support using `explorer.exe`
- ✅ **WSL (Windows Subsystem for Linux)**: Requires WSL to be mounted as a Windows drive
- ❌ **macOS/Linux**: Not supported (Windows Explorer specific)

## Troubleshooting

### "No file is currently selected or open"
- Make sure you have a file open in the editor or have selected a file in the explorer
- Try right-clicking directly on a file instead of using the command palette

### "Failed to reveal file in Explorer"
- Ensure you're on Windows or WSL environment
- Check that the file path is valid and accessible
- Try with a different file to isolate the issue

### WSL Path Issues
- Ensure your WSL distro is mounted as a Windows drive
- Check that the configured drive letter in settings matches your actual mount point
- The extension uses the configured drive letter (default: Z:) to convert WSL paths

## Important: Install wslview for WSL

**If the extension is not working in WSL, you need to install `wslview`:**

```bash
# Install wslview in your WSL distribution
sudo apt update
sudo apt install wslu
```

The `wslview` command (part of the `wslu` package) is required for WSL to properly open Windows applications like File Explorer. Without it, the extension won't be able to launch Windows Explorer from WSL.


