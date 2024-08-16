import * as vscode from "vscode";
import {
  activate as activateHoverProvider,
  deactivate as deactivateHoverProvider,
} from "./hoverProvider";
import {
  getRemoteFileConfigPath,
  i18nDirStartup,
  setRemoteCustomI18nDir,
} from "./i18nDirManager";
import { registerCommands } from "./commands";
import { checkPackageJsonFile } from "./detect-package-json";

export const EXTENSION_NAME = "I18n Peek";

export function activate(context: vscode.ExtensionContext) {
  // Verify the existence of the package.json file in the root of the project
  if (!checkPackageJsonFile()) {
    return;
  }

  // Register commands and event listeners
  registerCommands(context);

  // Watch for configuration file changes
  watchConfigFileChanges();

  // Activate the hover provider
  activateHoverProvider(context);

  i18nDirStartup();
}

export function deactivate() {
  deactivateHoverProvider();
}

/**
 * Watch for changes to the configuration file
 */
const watchConfigFileChanges = () => {
  vscode.workspace.onDidSaveTextDocument(async (document) => {
    const configFilePath = await getRemoteFileConfigPath();
    if (document.uri.fsPath === configFilePath) {
      await setRemoteCustomI18nDir();
    }
  });
};

/**
 * Set the NODE_TLS_REJECT_UNAUTHORIZED environment variable to the given value
 * @param value - Value to set the NODE_TLS_REJECT_UNAUTHORIZED environment variable to (default: "0", accepts "0" or "1")
 */
export const setNodeTLSRejectUnauthorizedTo = (value: "0" | "1" = "0") => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = value;
};