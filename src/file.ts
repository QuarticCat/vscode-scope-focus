import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { minimatch } from "minimatch";
import { Scope } from "./config";

export function unsetFileScope() {
  const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!!cwd && fs.existsSync(path.join(cwd, ".vscode", "settings.json"))) {
    const config = vscode.workspace.getConfiguration("files");
    config.update("exclude", undefined);
  }
}

export async function setFileScope({ include, exclude }: Scope) {
  const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!cwd) return;

  // Build exclusion list by walking directory tree
  const setting: { [_: string]: boolean } = Object.create(null);
  await collectExcludes(cwd, include, setting);

  // Add explicit excludes
  for (const excludePath of exclude) {
    setting[excludePath] = true;
  }

  // Update config
  const config = vscode.workspace.getConfiguration("files");
  config.update("exclude", setting);
}

function isPathWhitelisted(relativePath: string, whitelistPatterns: string[]): boolean {
  // Normalize path - remove leading ./ and convert to posix style
  const normPath = relativePath.replace(/\\/g, "/").replace(/^\.\//, "");

  if (normPath === "") {
    // Always include root
    return true;
  }

  for (const pattern of whitelistPatterns) {
    if (minimatch(normPath, pattern)) {
      return true;
    }
  }

  return false;
}

async function collectExcludes(
  repoRoot: string,
  whitelistPatterns: string[],
  excludes: { [_: string]: boolean }
): Promise<void> {

  async function walkDir(dirPath: string, depth: number = 0): Promise<void> {
    const relDir = path.relative(repoRoot, dirPath).replace(/\\/g, "/");
    const normalizedRelDir = relDir === "." ? "" : relDir;

    // If current directory itself is whitelisted, or any pattern starts with this directory, recurse deeper
    const isWhitelisted = isPathWhitelisted(normalizedRelDir, whitelistPatterns);
    const hasChildPatterns = whitelistPatterns.some(pattern =>
      pattern.startsWith(normalizedRelDir) ||
      pattern.startsWith(normalizedRelDir + "/")
    );

    if (isWhitelisted || hasChildPatterns) {
      try {
        const entries = await fs.promises.readdir(dirPath);
        for (const entry of entries) {
          const entryPath = path.join(dirPath, entry);

          try {
            const stats = await fs.promises.stat(entryPath);
            if (stats.isDirectory()) {
              await walkDir(entryPath, depth + 1);
            }
          } catch (err) {
            // Skip files/directories we can't access
            continue;
          }
        }
      } catch (err) {
        // Permission error, skip
      }
    } else {
      // Not whitelisted and no child patterns start with this folder, exclude it
      if (normalizedRelDir) {
        const excludePattern = `${normalizedRelDir}/**`;
        excludes[excludePattern] = true;
      }
      // If this is root folder (empty string), do NOT exclude everything!
    }
  }

  await walkDir(repoRoot);
}
