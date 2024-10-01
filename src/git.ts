import * as vscode from "vscode";
import { glob } from "glob";
import * as path from "path";
import { Scope } from "./config";

function getMaxDepth(): number | undefined {
  const config = vscode.workspace.getConfiguration("git");
  const maxDepth = config.get<number>("repositoryScanMaxDepth");
  return maxDepth === -1 ? undefined : maxDepth! + 1;
}

function toRepoPath(cwd: string, git: string): string {
  return path.join(cwd, path.dirname(git));
}

export async function unsetGitScope() {
  const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  const maxDepth = getMaxDepth();
  const repos = await glob("**/.git", { cwd, maxDepth });
  repos.forEach((p) => vscode.commands.executeCommand("git.openRepository", toRepoPath(cwd!, p)));
}

export async function setGitScope({ include, exclude }: Scope) {
  const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  const maxDepth = getMaxDepth();

  const includePaths = await glob(include, { cwd });
  const includeGlobs: Set<string> = new Set([".git"]);
  for (let entry of includePaths) {
    while (entry !== ".") {
      includeGlobs.add(path.join(entry, ".git"));
      entry = path.dirname(entry);
    }
  }

  const allRepos = await glob("**/.git", { cwd, maxDepth });
  const openRepos = await glob(Array.from(includeGlobs), { cwd, maxDepth });
  const closeRepos = allRepos.filter((p) => !openRepos.includes(p)); // O(nm), but should be fine if no too much repos

  openRepos.forEach((p) => vscode.commands.executeCommand("git.openRepository", toRepoPath(cwd!, p)));
  closeRepos.forEach((p) => vscode.commands.executeCommand("git.close", toRepoPath(cwd!, p)));
}
