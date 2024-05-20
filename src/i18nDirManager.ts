import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as vscode from "vscode";
import { CONFIG_REMOTE_FILE, I18N_HELPER_DIR } from "./i18nRemoteConfig";
import { promisify } from "util";
import { EXTENSION_NAME, setNodeTLSRejectUnauthorizedTo } from "./extension";
import * as jsonc from "jsonc-parser";
import { getValueFromJsonPath } from "./hoverProvider";
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
 * Custom i18n directory path
 */
let i18nDir: string = defaultI18nDir;

/**
 * Set the custom i18n directory path
 */
export async function setLocalCustomI18nDir(): Promise<void> {
  const selectedFolder = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "Select i18n directory folder",
  });
  if (selectedFolder?.length) {
    const customDir = selectedFolder[0].fsPath;
    if (customDir) {
      setI18nDir(customDir);
      vscode.window.showInformationMessage(
        `${EXTENSION_NAME}: Custom i18n directory path set successfully.`
      );
    }
  }
}

export async function setRemoteCustomI18nDir() {
  const configFilePath = path.join(I18N_HELPER_DIR, CONFIG_REMOTE_FILE);
  const configContent = await readFile(configFilePath, "utf8");
  const config = jsonc.parse(configContent);

  const { url, method, settings, responsePath, ignoreCertificateErrors } =
    config;
  setNodeTLSRejectUnauthorizedTo(ignoreCertificateErrors ? "0" : "1");
  try {
    const workspaceStorage = path.join(I18N_HELPER_DIR, "i18n");
    const settingSize = Object.keys(settings).length;
    let count = 0;
    for (const key in settings) {
      const { headers, params, lang, body } = settings[key];
      if (!lang) {
        vscode.window.showInformationMessage(
          `${EXTENSION_NAME}: Language not specified in the configuration file. It's recommended to specify a language for the i18n files.`
        );
      }
      const response = await axios({
        url,
        method,
        headers,
        params,
        data: body,
        httpsAgent: new (require("https").Agent)({
          rejectUnauthorized: !ignoreCertificateErrors,
        }),
      });
      const i18nData = getValueFromJsonPath(response.data, responsePath);
      if (!i18nData) {
        vscode.window.showErrorMessage(
          `${EXTENSION_NAME}: No I18n data was found at the specified path.`
        );
        continue;
      }

      if (!fs.existsSync(workspaceStorage)) {
        fs.mkdirSync(workspaceStorage, { recursive: true });
      }

      const filePath = path.join(
        workspaceStorage,
        `${lang || settings[key]}.json`
      );
      await writeFile(filePath, JSON.stringify(i18nData, null, 2));
      count++;
    }

    if (settingSize && count && settingSize === count) {
      vscode.window.showInformationMessage(
        `${EXTENSION_NAME}: i18n files fetched and saved successfully in ${workspaceStorage}.`
      );
      setI18nDir(workspaceStorage);
    } else if (settingSize && count && settingSize !== count) {
      vscode.window.showWarningMessage(
        `${EXTENSION_NAME}: Some i18n files were not fetched.`
      );
      setI18nDir(workspaceStorage);
    } else {
      vscode.window.showWarningMessage(
        `${EXTENSION_NAME}: No i18n files were fetched.`
      );
    }
    setNodeTLSRejectUnauthorizedTo("1");
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `${EXTENSION_NAME}: Error fetching i18n files: ${error.message}`
    );
    setNodeTLSRejectUnauthorizedTo("1");
  }
}

export function getI18nDir(): string {
  return i18nDir || defaultI18nDir;
}

function setI18nDir(path: string): void {
  if (getI18nDir() !== path) {
    i18nDir = path;
  }
}

export async function remoteI18nDirStartup() {
  const configFilePath = path.join(I18N_HELPER_DIR, CONFIG_REMOTE_FILE);
  if (fs.existsSync(configFilePath)) {
    setRemoteCustomI18nDir();
  }
}