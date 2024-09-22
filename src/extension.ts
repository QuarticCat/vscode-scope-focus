import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  // let channel = vscode.window.createOutputChannel("Scope Focus");

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
      const scopes = ["No Scope", ...Object.keys(config.get<object>("scopes") ?? {})];
      const selected = await vscode.window.showQuickPick(scopes, {
        title: "Switch Scope",
        placeHolder: "Select a scope to switch to",
      });
      if (typeof selected === "string") {
        config.update("activeScope", selected === "No Scope" ? null : selected);
      }
    })
  );

  status.text = `$(list-tree) No Scope`;
  status.show();
}

export function deactivate() {
  // Reset `files.exclude`.
  const filesConfig = vscode.workspace.getConfiguration("files");
  filesConfig.update("exclude", {});
}
