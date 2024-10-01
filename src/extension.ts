import * as vscode from "vscode";
import { Scopes } from "./config";
import { unsetFileScope, setFileScope } from "./file";
import { unsetGitScope, setGitScope } from "./git";

let activeScope: string | null = null;

async function updateScope(status: vscode.StatusBarItem, init: boolean = false) {
  const config = vscode.workspace.getConfiguration("scope-focus");
  const scopes = config.get<Scopes>("scopes")!;

  if (activeScope === null) {
    status.text = `$(list-tree) No Scope`;
    status.backgroundColor = undefined;
    if (!init) {
      unsetFileScope();
      unsetGitScope();
    }
  } else if (!(activeScope in scopes)) {
    status.text = `$(list-tree) Unknown`;
    status.backgroundColor = new vscode.ThemeColor("statusBarItem.errorBackground");
    vscode.window.showErrorMessage(`Unknown scope: ${activeScope}`);
    unsetFileScope();
    unsetGitScope();
  } else {
    status.text = `$(list-tree) ${activeScope}`;
    status.backgroundColor = undefined;
    setFileScope(scopes[activeScope]);
    setGitScope(scopes[activeScope]);
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
        activeScope = selected === "No Scope" ? null : selected;
        updateScope(status);
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
  updateScope(status, true);
}

export function deactivate() {}
