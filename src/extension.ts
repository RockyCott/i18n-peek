import * as vscode from "vscode";
import {
  activate as activateHoverProvider,
  deactivate as deactivateHoverProvider,
} from "./hoverProvider";
import {
  getI18nDir,
  remoteI18nDirStartup,
  setLocalCustomI18nDir,
  setRemoteCustomI18nDir,
} from "./i18nDirManager";
import {
  CONFIG_REMOTE_FILE,
  I18N_PEEK_DIR,
  openConfigFile,
} from "./i18nRemoteConfig";
import * as path from "path";
import { checkPackageJsonFile } from "./detect-package-json";
import { searchText } from "./search-text";

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

  remoteI18nDirStartup();
}

export function deactivate() {
  deactivateHoverProvider();
}

/**
 * Set the NODE_TLS_REJECT_UNAUTHORIZED environment variable to the given value
 * @param value - Value to set the NODE_TLS_REJECT_UNAUTHORIZED environment variable to (default: "0", accepts "0" or "1")
 */
export const setNodeTLSRejectUnauthorizedTo = (value: "0" | "1" = "0") => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = value;
};

/**
 * Registers the commands for the extension
 * @param context - The extension context
 */
const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand("i18nPeek.setI18nDir", setI18nDir),
    vscode.commands.registerCommand(
      "i18nPeek.currentI18nDir",
      showCurrentI18nDir
    ),
    vscode.commands.registerCommand("i18nPeek.searchText", searchTextCommand)
  );
};

/**
 * Handler for setting the custom i18n directory
 */
const setI18nDir = async () => {
  // Ask the user if they want to set the custom i18n directory locally or remotely (in the configuration file)
  const value = await vscode.window.showQuickPick(["Local", "Remote"], {
    placeHolder: "Select the type of i18n directory",
  });
  if (value === "Local") {
    await setLocalCustomI18nDir();
  } else if (value === "Remote") {
    await openConfigFile();
  }
};

/**
 * Shows the current i18n directory
 */
const showCurrentI18nDir = () => {
  const currentI18nDir = getI18nDir();
  vscode.window.showInformationMessage(
    `${EXTENSION_NAME}: Current i18n directory is ${currentI18nDir}`
  );
};

/**
 * Watch for changes to the configuration file
 */
const watchConfigFileChanges = () => {
  vscode.workspace.onDidSaveTextDocument(async (document) => {
    const configFilePath = path.join(I18N_PEEK_DIR, CONFIG_REMOTE_FILE);
    if (document.uri.fsPath === configFilePath) {
      await setRemoteCustomI18nDir();
    }
  });
};

/**
 * Command handler for searching text
 */
const searchTextCommand = () => {
  searchText();
};