import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

/**
 * Check if the .gitlab-ci.yml file exists in the root of the project.
 * @returns {boolean} True if the .gitlab-ci.yml file exists, false otherwise.
 */
export function checkGitLabCIFile(): boolean {
  const gitLabCIFilePath = getGitLabCIFilePath();
  return gitLabCIFilePath ? fs.existsSync(gitLabCIFilePath) : false;
}

/**
 * Extract the value of the PROJECT key in the .gitlab-ci.yml file.
 * @returns {string | null} The value of the PROJECT key, or null if not found.
 */
export function extractProjectValueGitlabCI(): string | null {
  const gitLabCIFilePath = getGitLabCIFilePath();
  if (!gitLabCIFilePath) {
    return null;
  }
  try {
    const gitLabCIContent = fs.readFileSync(gitLabCIFilePath, "utf8");
    const match = gitLabCIContent.match(/PROJECT:\s*(\w+)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Get the path to the .gitlab-ci.yml file in the root of the project.
 * @returns {string | null} The path to the .gitlab-ci.yml file, or null if workspaceFolders is not defined.
 */
function getGitLabCIFilePath(): string | null {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return null;
  }

  return path.join(workspaceFolder.uri.fsPath, ".gitlab-ci.yml");
}
