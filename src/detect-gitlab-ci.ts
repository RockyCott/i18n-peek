import * as vscode from "vscode";
import * as fs from "fs";

/**
 * Check if the gitlab-ci.yml file exists in the root of the project.
 * @returns - True if the gitlab-ci.yml file exists, false otherwise
 */
export function checkGitLabCIFile(): boolean {
  const projectPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!projectPath) {
    return false;
  }

  const gitLabCIFilePath = getGitLabCIFilePath();

  return fs.existsSync(gitLabCIFilePath);
}

/**
 * Extract the value of the PROJECT key in the gitlab-ci.yml file.
 * @returns - The value of the PROJECT key in the gitlab-ci.yml file
 */
export function extractProjectValueGitlabCI(): string | null {
  if (checkGitLabCIFile() === false) {
    return null;
  }
  const gitLabCIFilePath = getGitLabCIFilePath();
  const gitLabCIContent = fs.readFileSync(gitLabCIFilePath, "utf8");

  const match = gitLabCIContent?.match(/PROJECT:\s*(\w+)/);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Get the path to the gitlab-ci.yml file in the root of the project
 * @returns - The path to the gitlab-ci.yml file in the root of the project
 */
function getGitLabCIFilePath(): string {
  return `${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/.gitlab-ci.yml`;
}
