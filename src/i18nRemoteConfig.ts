import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";
const writeFile = promisify(fs.writeFile);
export const CONFIG_REMOTE_FILE = "i18n-config.jsonc";
const CONFIG_REMOTE_TEMPLATE = `
{
  // URL for fetching i18n data
  "url": "https://example.com/api/i18n",

  // HTTP method for the request (GET or POST)
  "method": "GET",

  // Individual settings for each language request
  "settings": {
    "1": {
      // Query parameters to be sent with the request
      "params": {
        "module": "home"
      },

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
      "params": {
        "module": "home"
      },

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

export const I18N_HELPER_DIR: string = path.join(
  vscode.workspace.workspaceFolders![0].uri.fsPath || "",
  ".i18nHelper"
);

/**
 * Fetch and save i18n files from an endpoint
 * @param endpoint - URL of the endpoint
 * @param localDir - Local directory to save the i18n files
 */
export async function ensureConfigFileExists() {
  if (!fs.existsSync(I18N_HELPER_DIR)) {
    fs.mkdirSync(I18N_HELPER_DIR);
  }
  const configFilePath = path.join(I18N_HELPER_DIR, CONFIG_REMOTE_FILE);
  if (!fs.existsSync(configFilePath)) {
    await writeFile(configFilePath, CONFIG_REMOTE_TEMPLATE.trim(), "utf8");
  }
}

export async function openConfigFile() {
  await ensureConfigFileExists();
  const configFilePath = path.join(I18N_HELPER_DIR, CONFIG_REMOTE_FILE);

  const document = await vscode.workspace.openTextDocument(configFilePath);
  await vscode.window.showTextDocument(document);
}
