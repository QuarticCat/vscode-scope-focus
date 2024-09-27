import * as vscode from "vscode";
import { glob } from "glob";
import * as path from "path";
import * as fs from "fs";
import { Scope } from "./config";

export function unsetFileScope() {
  const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!!cwd && fs.existsSync(path.join(cwd, ".vscode", "settings.json"))) {
    const config = vscode.workspace.getConfiguration("files");
    config.update("exclude", undefined);
  }
}

export async function setFileScope({ include, exclude }: Scope) {
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
  const setting: { [_: string]: boolean } = Object.create(null);
  for (const entry of [...excludePaths, ...exclude]) {
    setting[entry] = true;
  }

  // Update config.
  const config = vscode.workspace.getConfiguration("files");
  config.update("exclude", setting);
}
