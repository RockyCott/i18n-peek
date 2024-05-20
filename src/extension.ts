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
import * as fs from "fs";
import { checkPackageJsonFile } from "./detect-package-json";

export const EXTENSION_NAME = "I18n Peek";

export function activate(context: vscode.ExtensionContext) {
  // Verify the existence of the package.json file in the root of the project
  if (!checkPackageJsonFile()) {
    return;
  }

  // Register the command to set the custom i18n Peek path
  context.subscriptions.push(
    vscode.commands.registerCommand("i18nPeek.setI18nDir", async () => {
      // Ask the user if they want to set the custom i18n directory locally or remotely (in the configuration file)
      vscode.window.showQuickPick(["Local", "Remote"]).then((value) => {
        if (value === "Local") {
          setLocalCustomI18nDir();
        } else {
          openConfigFile();
        }
      });
    })
  );

  // Register the command to get the current i18n directory
  context.subscriptions.push(
    vscode.commands.registerCommand("i18nPeek.currentI18nDir", () => {
      const currentI18nDir = getI18nDir();
      vscode.window.showInformationMessage(
        `${EXTENSION_NAME}: Current i18n directory is ${currentI18nDir}`
      );
    })
  );

  // Watch for configuration file changes
  vscode.workspace.onDidSaveTextDocument(async (document) => {
    const configFilePath = path.join(I18N_PEEK_DIR, CONFIG_REMOTE_FILE);
    if (document.uri.fsPath === configFilePath) {
      await setRemoteCustomI18nDir();
    }
  });

  remoteI18nDirStartup();

  // Activate the hover provider
  activateHoverProvider(context);
}

export function deactivate() {
  deactivateHoverProvider();
}

/**
 * Set the NODE_TLS_REJECT_UNAUTHORIZED environment variable to the given value
 * @param value - Value to set the NODE_TLS_REJECT_UNAUTHORIZED environment variable to (default: "0", accepts "0" or "1")
 */
export const setNodeTLSRejectUnauthorizedTo = (value: string = "0") => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = value;
};
