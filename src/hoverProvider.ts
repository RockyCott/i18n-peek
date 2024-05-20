import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { languageIcons } from "./language-icons";
import { getI18nDir } from "./i18nDirManager";
import { EXTENSION_NAME } from "./extension";

export function activate(context: vscode.ExtensionContext) {
  // Register the command to set the custom i18n directory
  const provider = vscode.languages.registerHoverProvider(
    { language: "html", scheme: "file" },
    createHoverProvider()
  );

  // Register the command to set the custom i18n directory
  const tsProvider = vscode.languages.registerHoverProvider(
    { language: "typescript", scheme: "file" },
    createHoverProvider()
  );

  context.subscriptions.push(provider);
}

export function deactivate() {}

/**
 * Create a hover provider for HTML and TypeScript.
 * @returns Provider for hover events
 */
function createHoverProvider(): vscode.HoverProvider {
  return {
    async provideHover(document, position, token) {
      const range = document.getWordRangeAtPosition(position, /(['"])(.*?)\1/);
      if (!range) {
        return null;
      }

      const word = document.getText(range);
      const translationKey = word.split("|")[0].trim().replace(/['"]/g, "");
      if (!validateRuta(translationKey)) {
        return null;
      }

      try {
        const translations = await getTranslations(translationKey);
        if (!translations) {
          return null;
        }
        return createHoverMessage(translations);
      } catch {
        return null;
      }
    },
  };
}

/**
 * Method that validates the ruta field
 * @param ruta - The ruta to validate
 * @returns - True if the ruta is valid, false otherwise
 */
function validateRuta(ruta: string): boolean {
  if (!ruta) {
    return false;
  }
  return (
    /^[A-Z0-9](?:[A-Z0-9_.]*[A-Z0-9])?$/.test(ruta) && !/[._]{2,}/.test(ruta)
  );
}

/**
 * Get translations for the given key.
 * @param key - Translation key.
 * @returns Object containing translations for different languages.
 */
async function getTranslations(
  key: string
): Promise<{ [key: string]: string } | null> {
  const i18nDir = getI18nDir();
  if (!fs.existsSync(i18nDir)) {
    throw new Error(`${EXTENSION_NAME}: I18n folder not found`);
  }

  const files = fs
    .readdirSync(i18nDir)
    .filter((file) => file.endsWith(".json"));
  let translations: { [key: string]: string } = {};
  let NoFoundMessages: any = {};
  for (const file of files) {
    const lang = path.basename(file, ".json");
    const filePath = path.join(i18nDir, file);
    const jsonContent = await fs.promises.readFile(filePath, "utf8");
    const jsonData = JSON.parse(jsonContent);
    const translation = getValueFromJsonPath(jsonData, key);
    if (translation === undefined) {
      NoFoundMessages[lang] = "@ I18n Message not found @";
    } else {
      translations[lang] = translation;
    }
  }
  if (Object.keys(NoFoundMessages).length > 0) {
    translations = { ...translations, ...NoFoundMessages };
  }
  return translations;
}

/**
 * Create a hover message with translations.
 * @param translations - Object containing translations for different languages.
 * @returns Hover message.
 */
function createHoverMessage(translations: {
  [key: string]: string;
}): vscode.Hover {
  let hoverMessage = `${EXTENSION_NAME}\n\n`;
  if (Object.keys(translations).length === 0) {
    return new vscode.Hover(hoverMessage + "No translations found.");
  }
  for (const lang in translations) {
    const icon = languageIcons[lang] || "🌍";
    hoverMessage += `${icon} ${lang}: ${translations[lang]}\n\n`;
  }
  return new vscode.Hover(new vscode.MarkdownString(hoverMessage));
}

/**
 * Function to get the value from a JSON object using a path
 * @param json - JSON object
 * @param path - Path to the value
 * @returns - The value from the JSON object
 */
export function getValueFromJsonPath(json: any, path: string): any {
  return path.split(".").reduce((prev, curr) => {
    return prev ? prev[curr] : undefined;
  }, json);
}
