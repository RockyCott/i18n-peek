import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";
import { extractProjectValueGitlabCI } from "./detect-gitlab-ci";
import { extractProjectValuePackageJSON } from "./detect-package-json";
import { getRemoteFileConfigPath } from "./i18nDirManager";

const writeFile = promisify(fs.writeFile);

export const CONFIG_REMOTE_FILE = "i18n-config.jsonc";

const CONFIG_REMOTE_TEMPLATE = `
{
  // URL for fetching i18n data
  "url": "https://example.com/api/i18n",

  // HTTP method for the request (GET or POST)
  "method": "GET",

  "params": {
    "module": "${
      extractProjectValueGitlabCI() ||
      extractProjectValuePackageJSON() ||
      "home"
    }"
  },

  // Individual settings for each language request
  "settings": {
    "1": {
      // Query parameters to be sent with the request
      "params": {},

      // HTTP headers to be sent with the request
      "headers": {
        "Content-Type": "application/json",
        "Next-Accept-Language": "es"
      },

      // Language to fetch with file name
      "lang": "es",

      // Request body
      "body": {}
    },
    "2": {
      // Query parameters to be sent with the request
      "params": {},

      // HTTP headers to be sent with the request
      "headers": {
        "Content-Type": "application/json",
        "Next-Accept-Language": "en"
      },

      // Language to fetch with file name
      "lang": "en",

      // Request body
      "body": {}
    }
    // Add more settings as needed
  },
  
  // Path within the response JSON where i18n data is located. Leave empty if the data is at the root level.
  "responsePath": "module",
  
  // Ignore SSL certificate errors (useful for self-signed certificates)
  "ignoreCertificateErrors": true
}
`;

/**
 * Directory to save the vscode configuration files
 */
export const VSCODE_DIR: string = path.join(
  vscode.workspace.workspaceFolders![0].uri.fsPath || "",
  ".vscode"
);

/**
 * Directory to save the i18n files
 */
export const I18N_PEEK_DIR: string = path.join(VSCODE_DIR, ".i18nPeek");

/**
 * Fetch and save i18n files from an endpoint
 * @param endpoint - URL of the endpoint
 * @param localDir - Local directory to save the i18n files
 */
export async function ensureConfigFileExists() {
  await ensureI18nPeekDirExists();

  const configFilePath = await getRemoteFileConfigPath();
  if (!fs.existsSync(configFilePath)) {
    await writeFile(configFilePath, CONFIG_REMOTE_TEMPLATE.trim(), "utf8");
  }
}

/**
 * Ensure the existence of the .vscode directory
 */
export async function ensureVsCodeDirExists() {
  if (!fs.existsSync(VSCODE_DIR)) {
    fs.mkdirSync(VSCODE_DIR);
  }
}

/**
 * Ensure the existence of the .i18nPeek directory
 */
export async function ensureI18nPeekDirExists() {
  await ensureVsCodeDirExists();
  if (!fs.existsSync(I18N_PEEK_DIR)) {
    fs.mkdirSync(I18N_PEEK_DIR);
  }
}

/**
 * Open the configuration file in the editor
 */
export async function openConfigFile() {
  const configFilePath = await getRemoteFileConfigPath();

  const document = await vscode.workspace.openTextDocument(configFilePath);
  await vscode.window.showTextDocument(document);
}

