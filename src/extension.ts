import * as vscode from "vscode";
import { glob } from "glob";
import * as path from "path";
import * as fs from "fs";

interface Scope {
  include: string[];
  exclude: string[];
}

interface Scopes {
  [name: string]: Scope;
}

/**
 * Check existence of `.vscode/settings.json`.
 */
function configExists(): boolean {
  const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  return !!cwd && fs.existsSync(path.join(cwd, ".vscode", "settings.json"));
}

/**
 * Derive `files.exclude` setting from scope definition.
 */
async function deriveFilesExclude({ include, exclude }: Scope): Promise<object> {
  // Convert to exclude paths.
  const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  const includePaths = await glob(include, { cwd });
  const includeGlobs: Set<string> = new Set();
  const excludeGlobs: Set<string> = new Set();
  for (let entry of includePaths) {
    while (entry !== ".") {
      includeGlobs.add(entry);
      entry = path.dirname(entry);
      excludeGlobs.add(path.join(entry, "*"));
    }
  }
  const excludePaths = await glob(Array.from(excludeGlobs), { cwd, dot: true, ignore: Array.from(includeGlobs) });

  // Convert to valid `files.exclude` setting.
  const setting: { [entry: string]: boolean } = Object.create(null);
  for (const entry of [...excludePaths, ...exclude]) {
    setting[entry] = true;
  }
  return setting;
}

/**
 * Update status bar and `files.exclude` according to current settings.
 */
async function updateScope(status: vscode.StatusBarItem) {
  const scopeConfig = vscode.workspace.getConfiguration("scope-focus");
  const filesConfig = vscode.workspace.getConfiguration("files");

  const activeScope = scopeConfig.get<string | null>("activeScope", null);
  const scopes = scopeConfig.get<Scopes>("scopes")!;

  if (activeScope === null) {
    status.text = `$(list-tree) No Scope`;
    status.backgroundColor = undefined;
    if (configExists()) {
      filesConfig.update("exclude", undefined);
    }
  } else if (!(activeScope in scopes)) {
    status.text = `$(list-tree) Unknown`;
    status.backgroundColor = new vscode.ThemeColor("statusBarItem.errorBackground");
    vscode.window.showErrorMessage(`Unknown scope: ${activeScope}`);
    if (configExists()) {
      filesConfig.update("exclude", undefined);
    }
  } else {
    status.text = `$(list-tree) ${activeScope}`;
    status.backgroundColor = undefined;
    filesConfig.update("exclude", await deriveFilesExclude(scopes[activeScope]));
  }

  if (Object.keys(scopes).length === 0) {
    status.hide();
  } else {
    status.show();
  }
}

export function activate(context: vscode.ExtensionContext) {
  // Create status bar item.
  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
  status.name = "Switch Scope";
  status.tooltip = "Switch Scope";
  status.command = "scope-focus.switchScope";
  context.subscriptions.push(status);

  // Register commands.
  context.subscriptions.push(
    vscode.commands.registerCommand("scope-focus.switchScope", async () => {
      const config = vscode.workspace.getConfiguration("scope-focus");
      const scopes = ["No Scope", ...Object.keys(config.get<object>("scopes")!)];
      const selected = await vscode.window.showQuickPick(scopes, {
        title: "Switch Scope",
        placeHolder: "Select a scope to switch to",
      });
      if (selected) {
        config.update("activeScope", selected === "No Scope" ? null : selected);
      }
    })
  );

  // Listen on configuration changes.
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("scope-focus")) {
        updateScope(status);
      }
    })
  );

  // Initialize.
  updateScope(status);
}

export function deactivate() {}
