import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { EXTENSION_NAME } from "./extension";

/**
 * Check if the package.json file exists in the root of the project.
 * @returns {boolean} True if the package.json file exists, false otherwise.
 */
export function checkPackageJsonFile(): boolean {
  const packageJsonPath = getPackageJsonPath();
  if (!packageJsonPath) {
    return false;
  }

  if (!fs.existsSync(packageJsonPath)) {
    vscode.window.showErrorMessage(
      `${EXTENSION_NAME}: No package.json file found in the root of the project.`
    );
    return false;
  }
  return true;
}

/**
 * Extract the value of the "name" key in the package.json file.
 * @returns {string | null} The value of the "name" key in the package.json file, or null if not found.
 */
export function extractProjectValuePackageJSON(): string | null {
  const packageJsonPath = getPackageJsonPath();
  if (!packageJsonPath || !checkPackageJsonFile()) {
    return null;
  }

  try {
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonContent);
    return packageJson?.name || null;
  } catch {
    return null;
  }
}

/**
 * Get the path to the package.json file in the root of the project.
 * @returns {string | null} The path to the package.json file, or null if workspaceFolders is not defined.
 */
function getPackageJsonPath(): string | null {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return null;
  }

  return path.join(workspaceFolder.uri.fsPath, "package.json");
}
