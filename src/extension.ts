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
  I18N_HELPER_DIR,
  openConfigFile,
} from "./i18nRemoteConfig";
import * as path from "path";

export const EXTENSION_NAME = "I18n Helper";

export function activate(context: vscode.ExtensionContext) {
  // Register the command to set the custom i18n Helper path
  context.subscriptions.push(
    vscode.commands.registerCommand("i18nHelper.setI18nDir", async () => {
      // preguntar si local o remote
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
    vscode.commands.registerCommand("i18nHelper.currentI18nDir", () => {
      const currentI18nDir = getI18nDir();
      // llevarlo a la carpeta
      vscode.window.showInformationMessage(
        `${EXTENSION_NAME}: Current i18n directory is ${currentI18nDir}`
      );
    })
  );

  // Watch for configuration file changes
  vscode.workspace.onDidSaveTextDocument(async (document) => {
    const configFilePath = path.join(I18N_HELPER_DIR, CONFIG_REMOTE_FILE);
    if (document.uri.fsPath === configFilePath) {
      await setRemoteCustomI18nDir();
    }
  });

  remoteI18nDirStartup();

  // Activar el proveedor de hover
  activateHoverProvider(context);
}

export function deactivate() {
  deactivateHoverProvider();
}

export const setNodeTLSRejectUnauthorizedTo = (value: string = "0") => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = value;
};
