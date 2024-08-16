import * as vscode from "vscode";
import * as path from "path";
import { searchText } from "./search-text";
import { openConfigFile } from "./i18nRemoteConfig";
import {
  getWorkspaceI18nCustomDir,
  removeGlobalI18nCustomDir,
  selectGlobalI18nCustomDir,
  setLocalCustomI18nDir,
  validateI18nDirToRelative,
} from "./i18nDirManager";
import { EXTENSION_NAME } from "./extension";

/**
 * Registers the commands for the extension
 * @param context - The extension context
 */
export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand("i18nPeek.setI18nDir", setI18nDirCommand),
    vscode.commands.registerCommand(
      "i18nPeek.currentI18nDir",
      showCurrentI18nDirCommand
    ),
    vscode.commands.registerCommand("i18nPeek.searchText", searchTextCommand),
    vscode.commands.registerCommand(
      "i18nPeek.setDirFromContext",
      setDirFromContextCommand
    ),
    vscode.commands.registerCommand(
      "i18nPeek.openRemoteFile",
      openConfigFileCommand
    ),
    vscode.commands.registerCommand(
      "i18nPeek.createI18nFiles",
      createI18nFileCommand
    ),
    vscode.commands.registerCommand(
      "i18nPeek.selectCustomDirFromGlobalCustomDirs",
      selectDirFromGlobalDirCommand
    ),
    vscode.commands.registerCommand(
      "i18nPeek.removeCustomDirFromGlobalCustomDirs",
      removeDirFromGlobalDirCommand
    )
  );
};

/**
 * Handler for setting the custom i18n directory
 */
const setI18nDirCommand = async () => {
  // Ask the user if they want to set the custom i18n directory locally or remotely (in the configuration file)
  const options = {
    local: "Local",
    remote: "Remote",
  };
  const value = await vscode.window.showQuickPick(
    [options.local, options.remote],
    {
      placeHolder: "Select the type of i18n directory",
    }
  );
  if (value === options.local) {
    await setLocalCustomI18nDir();
  } else if (value === options.remote) {
    await openConfigFile();
  }
};

/**
 * Shows the current i18n directory
 */
const showCurrentI18nDirCommand = () => {
  let currentI18nDir = getWorkspaceI18nCustomDir();
  currentI18nDir = validateI18nDirToRelative(currentI18nDir);
  vscode.window.showInformationMessage(
    `${EXTENSION_NAME}: Current i18n directory is ${currentI18nDir}`
  );
};

/**
 * Command handler for searching text
 */
const searchTextCommand = () => {
  searchText();
};

/**
 * Command to set the custom i18n directory from the context menu
 */
const setDirFromContextCommand = async (uri: vscode.Uri) => {
  const i18nDir = uri?.fsPath;

  if (i18nDir) {
    const workspaceFolder =
      vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? "";
    const relativePath = path.relative(workspaceFolder, i18nDir);
    setLocalCustomI18nDir(relativePath);
  } else {
    vscode.window.showErrorMessage(
      `${EXTENSION_NAME}: No folder or file selected.`
    );
  }
};

/**
 * Command to create i18n files for the given languages
 * @param uri - folder or file path to create i18n files
 */
const createI18nFileCommand = async (uri: vscode.Uri) => {
  let i18nDir = uri.fsPath;
  i18nDir = path.extname(i18nDir) ? path.dirname(i18nDir) : i18nDir;

  let langInput = await vscode.window.showInputBox({
    prompt: "Enter the language code (e.g. en, es, fr, en-US, es-ES, fr-FR)",
  });

  if (!langInput) {
    return;
  }

  const langs = langInput
    .split(",")
    .map((lang) => lang.trim())
    .filter((lang) => lang);

  const i18nData = {
    key1: "value1",
    key2: "value2",
    key3: {
      key4: "value4",
    },
  };

  langs.forEach((lang) => {
    const i18nFile = path.join(i18nDir, `${lang}.json`);
    vscode.workspace.fs.writeFile(
      vscode.Uri.file(i18nFile),
      Buffer.from(JSON.stringify(i18nData, null, 2))
    );
  });

  vscode.window.showInformationMessage(
    `${EXTENSION_NAME}: i18n files created for the languages: ${langs.join(
      ", "
    )}`
  );
};

/**
 * Command to select the i18n directory from the global directories
 */
const selectDirFromGlobalDirCommand = async () => {
  selectGlobalI18nCustomDir();
};

/**
 * Command to remove the i18n directory from the global directories
 */
export const removeDirFromGlobalDirCommand = async () => {
  removeGlobalI18nCustomDir();
};

/**
 * Command to open the configuration file
 */
export const openConfigFileCommand = async () => {
  openConfigFile();
};



