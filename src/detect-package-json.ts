import * as vscode from "vscode";
import * as fs from "fs";
import { EXTENSION_NAME } from "./extension";

/**
 * Check if the gitlab-ci.yml file exists in the root of the project.
 * @returns - True if the gitlab-ci.yml file exists, false otherwise
 */
export function checkPackageJsonFile(): boolean {
  const projectPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!projectPath) {
    return false;
  }

  const packageJsonPath = getPackageJsonPath();

  if (!fs.existsSync(packageJsonPath)) {
    vscode.window.showErrorMessage(
      `${EXTENSION_NAME}: No found package.json file in the root of the project.`
    );
    return false;
  }
  return true;
}

/**
 * Extract the value of the PROJECT key in the gitlab-ci.yml file.
 * @returns - The value of the PROJECT key in the gitlab-ci.yml file
 */
export function extractProjectValuePackageJSON(): string | null {
  if (checkPackageJsonFile() === false) {
    return null;
  }
  const packageJsonFilePath = getPackageJsonPath();

  const packageJsonContent = fs.readFileSync(packageJsonFilePath, "utf8");
  try {
    const packageJson = JSON.parse(packageJsonContent);
    return packageJson?.name || null;
  } catch {
    return null;
  }
}

/**
 * Get the path to the package.json file in the root of the project
 * @returns - The path to the package.json file in the root of the project
 */
function getPackageJsonPath(): string {
  return `${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/package.json`;
}
