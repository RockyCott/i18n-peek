import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as vscode from "vscode";
import {
  CONFIG_REMOTE_FILE,
  I18N_PEEK_DIR,
  ensureI18nPeekDirExists,
  openConfigFile,
} from "./i18nRemoteConfig";
import { promisify } from "util";
import { EXTENSION_NAME, setNodeTLSRejectUnauthorizedTo } from "./extension";
import * as jsonc from "jsonc-parser";
import { getValueFromJsonPath } from "./json-util";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * Default i18n directory path
 */
const defaultI18nDir: string = path.join(
  vscode.workspace.workspaceFolders?.[0].uri.fsPath || "",
  "src",
  "assets",
  "i18n"
);

/**
 * @interface globalCustomDirDTO
 * @property {string[]} local - Local custom directories
 * @property {any} remote - Remote custom directories
 */
interface globalCustomDirDTO {
  local: string[];
  remote: any;
}

/**
 * Set the custom i18n directory path
 */
export async function setLocalCustomI18nDir(dir: string = ""): Promise<void> {
  if (!dir) {
    const selectedFolder = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select i18n directory folder",
    });
    if (selectedFolder?.length) {
      dir = selectedFolder[0].fsPath;
    }
  }
  if (dir) {
    setI18nDir(dir);
  } else {
    vscode.window.showInformationMessage("No directory selected.");
  }
}

/**
 * Get the path to the configuration file
 * @returns {string} The path to the configuration file
 */
export async function getRemoteFileConfigPath(): Promise<string> {
  await ensureI18nPeekDirExists();
  return path.join(I18N_PEEK_DIR, CONFIG_REMOTE_FILE);
}

/**
 * Fetch and save i18n files from an endpoint
 */
export async function setRemoteCustomI18nDir() {
  const configFilePath = await getRemoteFileConfigPath();
  let config;
  try {
    const configContent = await readFile(configFilePath, "utf8");
    config = jsonc.parse(configContent);
  } catch {
    vscode.window.showErrorMessage(
      `${EXTENSION_NAME}: Error parsing the configuration file.`
    );
    return;
  }

  const {
    url,
    method,
    params,
    settings,
    responsePath,
    ignoreCertificateErrors,
  } = config;

  if (!url) {
    vscode.window.showErrorMessage(
      `${EXTENSION_NAME}: URL not specified in the configuration file.`
    );
    return;
  }

  setNodeTLSRejectUnauthorizedTo(ignoreCertificateErrors ? "0" : "1");

  try {
    const workspaceStorage = path.join(I18N_PEEK_DIR, "i18n");
    if (!fs.existsSync(workspaceStorage)) {
      fs.mkdirSync(workspaceStorage, { recursive: true });
    }
    const settingSize = Object.keys(settings)?.length;

    if (!settingSize) {
      vscode.window.showWarningMessage(
        `${EXTENSION_NAME}: No i18n settings found in the configuration file.`
      );
      return;
    }

    let count = 0;
    let errorMessages: string[] = [];
    for (const key in settings) {
      const { headers, params: settingParams, lang, body } = settings[key];

      if (!lang) {
        vscode.window.showInformationMessage(
          `${EXTENSION_NAME}: Language not specified in the configuration file. It's recommended to specify a language for the i18n files.`
        );
      }
      try {
        const response = await axios({
          url,
          method: method || "GET",
          headers,
          params: { ...params, ...settingParams },
          data: body,
          httpsAgent: new (require("https").Agent)({
            rejectUnauthorized: !ignoreCertificateErrors,
          }),
        });
        const i18nData = getValueFromJsonPath(
          response?.data || {},
          responsePath
        );
        if (!i18nData) {
          errorMessages.push(
            ` /-/ ${key}: No I18n data was found at the specified path.`
          );
          continue;
        }
        const filePath = path.join(
          workspaceStorage,
          `${lang || settings[key]}.json`
        );
        await writeFile(filePath, JSON.stringify(i18nData, null, 2));
        count++;
      } catch (error: any) {
        errorMessages.push(
          `/-/ Error fetching i18n file for ${key}: ${error.message}.`
        );
      }
    }
    handleFetchResults(settingSize, count, errorMessages, workspaceStorage);
    setNodeTLSRejectUnauthorizedTo("1");
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `${EXTENSION_NAME}: Error fetching i18n files: ${error.message}`
    );
    setNodeTLSRejectUnauthorizedTo("1");
  }
}

/**
 * Handle the fetch results
 * @param settingSize - Number of settings
 * @param count - Number of fetched i18n files
 * @param errorMessages - Error messages
 * @param workspaceStorage - Workspace storage path
 */
function handleFetchResults(
  settingSize: number,
  count: number,
  errorMessages: string[],
  workspaceStorage: string
): void {
  if (settingSize && count && settingSize === count) {
    vscode.window.showInformationMessage(
      `${EXTENSION_NAME}: i18n files fetched and saved successfully in ${workspaceStorage}.`
    );
    setI18nDir(workspaceStorage, true);
  } else if (settingSize && count && settingSize !== count) {
    vscode.window.showWarningMessage(
      `${EXTENSION_NAME}: Some i18n files were not fetched.`
    );
    vscode.window.showErrorMessage(
      `${EXTENSION_NAME}: ${errorMessages.join("")}`
    );
    setI18nDir(workspaceStorage, true);
  } else {
    vscode.window.showWarningMessage(
      `${EXTENSION_NAME}: No i18n files were fetched.`
    );
    vscode.window.showErrorMessage(
      `${EXTENSION_NAME}: ${errorMessages.join("")}`
    );
  }
}

/**
 * Set the custom i18n directory path
 * @param path - Custom i18n directory relative path
 */
async function setI18nDir(
  dirPath: string,
  remote: boolean = false
): Promise<void> {
  if (getWorkspaceI18nCustomDir() === dirPath) {
    return;
  }
  // const workspaceFolder =
  //   vscode.workspace.workspaceFolders?.[0].uri.fsPath || "";
  //i18nDir = path.join(workspaceFolder, dirPath);
  const validDir =
    fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
  if (!validDir) {
    vscode.window.showErrorMessage(
      `${EXTENSION_NAME}: Invalid directory path: ${dirPath}`
    );
    return;
  }

  vscode.window.showInformationMessage(
    `${EXTENSION_NAME}: i18n directory set to: ${dirPath}`
  );

  saveCustomConfig(remote ? "remote" : "local");

  saveWorkspaceI18nCustomDir(dirPath);

  await updateGlobalCustomDirs(dirPath, remote);
}

/**
 * Save the custom configuration
 * @param config - Custom configuration
 */
function saveCustomConfig(config: "local" | "remote"): void {
  vscode.workspace
    .getConfiguration()
    .update(
      "i18nPeek.customConfig",
      config,
      vscode.ConfigurationTarget.Workspace
    );
}

/**
 * Get the custom configuration
 * @returns - The custom configuration
 */
export function getCustomConfig(): "local" | "remote" {
  return vscode.workspace
    .getConfiguration()
    .get<"local" | "remote">("i18nPeek.customConfig", "local");
}

/**
 * Update the global custom directories
 * @param dirPath - Custom i18n directory path
 * @param remote - Remote custom directory flag
 */
async function updateGlobalCustomDirs(
  dirPath: string,
  remote: boolean
): Promise<void> {
  const customDirs = getGlobalI18nCustomDir();
  if (remote) {
    const configFilePath = await getRemoteFileConfigPath();
    try {
      const configFile = await readFile(configFilePath, "utf8");
      const configContent = jsonc.parse(configFile);
      const remoteDirs = customDirs?.remote || {};
      const projectName = vscode.workspace.name || "project";
      remoteDirs[projectName] = configContent;
      saveGlobalI18nCustomDir({
        local: customDirs.local,
        remote: remoteDirs,
      });
    } catch (error) {
      vscode.window.showErrorMessage(
        `${EXTENSION_NAME}: Error parsing the configuration file.`
      );
    }
  } else {
    const setCustomDirs: Set<string> = new Set(customDirs.local);
    setCustomDirs.add(dirPath);
    saveGlobalI18nCustomDir({
      local: Array.from(setCustomDirs),
      remote: customDirs.remote,
    });
  }
}

/**
 * Get the custom i18n directory path
 * @returns - The custom i18n directory path
 */
export function getWorkspaceI18nCustomDir(): string {
  return vscode.workspace
    .getConfiguration()
    .get<string>("i18nPeek.WorkspaceCustomDir", "src/assets/i18n");
}

/**
 * Save the custom i18n directory path
 * @param dir - Custom i18n directory path
 */
function saveWorkspaceI18nCustomDir(dir: string): void {
  vscode.workspace
    .getConfiguration()
    .update(
      "i18nPeek.WorkspaceCustomDir",
      dir,
      vscode.ConfigurationTarget.Workspace
    );
}

/**
 * Get the global custom directories
 * @returns - The global custom directories
 */
export function getGlobalI18nCustomDir(): globalCustomDirDTO {
  let globalCustomDir = vscode.workspace
    .getConfiguration()
    .get<globalCustomDirDTO>("i18nPeek.GlobalCustomDir") || {
    local: [],
    remote: "{}",
  };
  globalCustomDir = jsonc.parse(JSON.stringify(globalCustomDir));
  globalCustomDir.remote = globalCustomDir.remote;
  return globalCustomDir;
}

export function saveGlobalI18nCustomDir(dirs: globalCustomDirDTO): void {
  const newDirs = {
    local: dirs.local || [],
    remote: JSON.stringify(dirs.remote || {}),
  };
  vscode.workspace
    .getConfiguration()
    .update(
      "i18nPeek.GlobalCustomDir",
      dirs,
      vscode.ConfigurationTarget.Global
    );
}

export async function removeGlobalI18nCustomDir(): Promise<void> {
  const globalCustomDirs = getGlobalI18nCustomDir();
  const remoteKeys = Object.keys(globalCustomDirs?.remote);
  if (globalCustomDirs?.local?.length === 0 && remoteKeys?.length === 0) {
    vscode.window.showErrorMessage("No global directories found.");
    return;
  }

  const value = await vscode.window.showQuickPick(["Local", "Remote"], {
    placeHolder: "Select the type of i18n directory",
  });

  if (!value) {
    return;
  }

  if (value === "Local") {
    await removeLocalCustomDirs(globalCustomDirs.local);
  } else if (value === "Remote") {
    await removeRemoteCustomDirs(remoteKeys, globalCustomDirs.remote);
  }
}

async function removeRemoteCustomDirs(
  remoteKeys: string[],
  remoteDirs: any
): Promise<void> {
  const selectedRemoteDirs =
    (await vscode.window.showQuickPick(remoteKeys, {
      placeHolder: "Select the remote directories",
      canPickMany: true,
    })) || [];
  if (selectedRemoteDirs?.length) {
    selectedRemoteDirs.forEach((remoteDir) => {
      delete remoteDirs[remoteDir];
    });
    saveGlobalI18nCustomDir({
      local: getGlobalI18nCustomDir().local,
      remote: remoteDirs,
    });
    vscode.window.showInformationMessage(
      `${EXTENSION_NAME}: Directory removed successfully.`
    );
  }
}

async function removeLocalCustomDirs(dirs: string[]): Promise<void> {
  const SelectedDirs = await vscode.window.showQuickPick(dirs, {
    placeHolder: "Select the directories",
    canPickMany: true,
  });
  if (SelectedDirs) {
    const setCustomDirs: Set<string> = new Set(dirs);
    SelectedDirs.forEach((dir) => {
      setCustomDirs.delete(dir);
    });
    saveGlobalI18nCustomDir({
      local: Array.from(setCustomDirs),
      remote: getGlobalI18nCustomDir().remote,
    });
    vscode.window.showInformationMessage(
      `${EXTENSION_NAME}: Directory removed successfully.`
    );
  }
}

/**
 * Check if the custom i18n directory path is set
 */
export async function remoteI18nDirStartup() {
  const configFilePath = await getRemoteFileConfigPath();
  if (fs.existsSync(configFilePath)) {
    await setRemoteCustomI18nDir();
  }
}

/**
 * Check if the custom i18n directory path is set
 */
export async function i18nDirStartup() {
  const i18nDirConfig = vscode.workspace
    .getConfiguration()
    .get<string>("i18nPeek.WorkspaceCustomDir", "src/assets/i18n");
  const customConfig = getCustomConfig();
  console.log(customConfig, i18nDirConfig);
  if (i18nDirConfig) {
    if (customConfig === "local") {
      setI18nDir(i18nDirConfig);
    } else {
      await remoteI18nDirStartup();
    }
  }
}

export async function selectGlobalI18nCustomDir() {
  const value = await vscode.window.showQuickPick(["Local", "Remote"], {
    placeHolder: "Select the type of i18n directory",
  });

  if (!value) {
    return;
  }

  const globalDir = getGlobalI18nCustomDir();
  if (value === "Local") {
    const dirs = globalDir.local || [];
    if (dirs.length === 0) {
      vscode.window.showErrorMessage("No global directories found.");
      return;
    }
    const dir = await vscode.window.showQuickPick(dirs, {
      placeHolder: "Select the directory",
    });
    if (dir) {
      await setLocalCustomI18nDir(dir);
    }
  } else if (value === "Remote") {
    const remoteDirs = globalDir.remote || {};
    const keys = Object.keys(remoteDirs);
    if (keys.length === 0) {
      vscode.window.showErrorMessage("No global directories found.");
      return;
    }
    const dir = await vscode.window.showQuickPick(keys, {
      placeHolder: "Select the directory",
    });
    if (dir) {
      const config = remoteDirs[dir];
      const configFilePath = await getRemoteFileConfigPath();
      await writeFile(configFilePath, JSON.stringify(config, null, 2));
      await openConfigFile();
    }
  }
}
