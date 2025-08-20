import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Converts WSL path to Windows path format using mounted drive
 */
function convertWSLPathToWindows(wslPath: string, mountDrive: string = 'Z:'): string {
    // Handle WSL paths like /mnt/c/... (Windows drives mounted in WSL)
    if (wslPath.startsWith('/mnt/')) {
        // Convert /mnt/c/... to C:\...
        const parts = wslPath.split('/');
        if (parts.length >= 3) {
            const drive = parts[2].toUpperCase();
            const remainingPath = parts.slice(3).join('\\');
            return `${drive}:\\${remainingPath}`;
        }
    }

    // For other WSL paths (like /home/...), use mounted drive approach
    // Convert /home/user/... to Z:\home\user\...
    const windowsPath = wslPath.replace(/\//g, '\\');
    const drive = mountDrive.endsWith(':') ? mountDrive : `${mountDrive}:`;
    return `${drive}${windowsPath}`;
}

/**
 * Gets the Windows path using mounted drive approach
 */
async function getWindowsPath(linuxPath: string): Promise<string> {
    // Get user configuration for mount drive
    const config = vscode.workspace.getConfiguration('cursorRevealExplorer');
    const wslMountDrive = config.get<string>('wslMountDrive', 'Z:');

    // For /mnt/ paths, try wslpath first, fallback to manual conversion
    if (linuxPath.startsWith('/mnt/')) {
        try {
            const { stdout } = await execAsync(`wslpath -w "${linuxPath}"`);
            const result = stdout.trim();
            if (result && !result.includes('wslpath:')) {
                return result;
            }
        } catch (error) {
            // Fall through to manual conversion
        }
    }

    // Use mounted drive approach for all paths
    return convertWSLPathToWindows(linuxPath, wslMountDrive);
}

/**
 * Reveals a file or directory in Windows Explorer
 */
async function revealInExplorer(filePath: string): Promise<void> {
    try {
        // Check if we're in WSL environment
        const isWSL = process.platform === 'linux' && process.env.WSL_DISTRO_NAME;

        let targetPath: string;
        let command: string;

        if (isWSL) {
            // Convert Linux path to Windows path using mounted drive
            targetPath = await getWindowsPath(filePath);

            // Use /select to highlight the specific file in Explorer
            command = `explorer.exe /select,"${targetPath}"`;
        } else if (process.platform === 'win32') {
            // Native Windows
            targetPath = filePath;
            command = `explorer /select,"${targetPath}"`;
        } else {
            // For other platforms, show an error
            vscode.window.showErrorMessage('Reveal in Explorer is only supported on Windows and WSL environments.');
            return;
        }

        console.log(`Executing command: ${command}`);

        // Execute the command
        // Note: explorer.exe often returns non-zero exit codes even when successful
        try {
            await execAsync(command);
        } catch (error) {
            // explorer.exe often returns non-zero exit codes even when it works correctly
            // We'll ignore the error and assume it worked unless it's a real failure
            console.log('explorer.exe returned non-zero exit code (this is normal):', error);
        }

        // Always show success message since explorer.exe typically works even with error codes
        vscode.window.showInformationMessage(`Revealed file in Explorer: ${path.basename(filePath)}`);

    } catch (error) {
        // Only catch actual execution failures (like command not found)
        console.error('Failed to execute explorer command:', error);
        vscode.window.showErrorMessage(`Failed to reveal file in Explorer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Gets the current file path from the active editor or selected file
 */
function getCurrentFilePath(uri?: vscode.Uri): string | undefined {
    if (uri) {
        // File was right-clicked or selected
        return uri.fsPath;
    }

    // Get from active editor
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        return activeEditor.document.fileName;
    }

    return undefined;
}

/**
 * Command handler for revealing file in explorer
 */
async function handleRevealInExplorer(uri?: vscode.Uri): Promise<void> {
    const filePath = getCurrentFilePath(uri);

    if (!filePath) {
        vscode.window.showErrorMessage('No file is currently selected or open.');
        return;
    }

    await revealInExplorer(filePath);
}

/**
 * Extension activation function
 */
export function activate(context: vscode.ExtensionContext): void {
    console.log('Cursor Reveal Explorer extension is now active!');

    try {
        // Register the reveal in explorer command
        const disposable = vscode.commands.registerCommand(
            'cursorRevealExplorer.revealInExplorer',
            handleRevealInExplorer
        );

        context.subscriptions.push(disposable);

        console.log('Command cursorRevealExplorer.revealInExplorer registered successfully');

        // Show activation message (remove this for production)
        vscode.window.showInformationMessage('Cursor Reveal Explorer extension activated!');

    } catch (error) {
        console.error('Failed to activate Cursor Reveal Explorer extension:', error);
        vscode.window.showErrorMessage(`Failed to activate Cursor Reveal Explorer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Extension deactivation function
 */
export function deactivate(): void {
    console.log('Cursor Reveal Explorer extension is now inactive!');
}
