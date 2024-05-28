import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { languageIcons } from "./language-icons";
import { getI18nDir } from "./i18nDirManager";
import { EXTENSION_NAME } from "./extension";
import { getValueFromJsonPath } from "./json-util";

export function activate(context: vscode.ExtensionContext) {
  // Create hover providers for HTML and TypeScript files
  const htmlProvider = createHoverProvider(["html"]);
  const tsProvider = createHoverProvider(["typescript"]);

  // Register hover providers
  context.subscriptions.push(htmlProvider);
  context.subscriptions.push(tsProvider);
}

export function deactivate() {}

/**
 * Create a hover provider for specified languages.
 * @param languages - Array of language identifiers.
 * @returns Provider for hover events.
 */
function createHoverProvider(languages: string[]): vscode.Disposable {
  return vscode.languages.registerHoverProvider(
    languages.map((language) => ({ language, scheme: "file" })),
    {
      async provideHover(document, position, token) {
        const range = document.getWordRangeAtPosition(
          position,
          /(['"])(.*?)\1/
        );
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
    }
  );
}

/**
 * Validate the translation key.
 * @param ruta - The translation key to validate.
 * @returns True if the key is valid, false otherwise.
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
    throw new Error(`${EXTENSION_NAME}: I18n folder not found.`);
  }

  const files = fs
    .readdirSync(i18nDir)
    .filter((file) => file.endsWith(".json"));
  let translations: { [key: string]: string } = {};
  let noFoundMessages: { [key: string]: string } = {};

  for (const file of files) {
    const lang = path.basename(file, ".json");
    const filePath = path.join(i18nDir, file);
    try {
      const jsonContent = await fs.promises.readFile(filePath, "utf8");
      const jsonData = JSON.parse(jsonContent);
      const translation = jsonData[key] || getValueFromJsonPath(jsonData, key);
      if (translation === undefined) {
        noFoundMessages[lang] = "@ Not found @";
      } else {
        translations[lang] = translation;
      }
    } catch (error) {
      noFoundMessages[lang] = "@ Error reading translation @";
    }
  }
  return { ...translations, ...noFoundMessages };
}

/**
 * Create a hover message with translations.
 * @param translations - Object containing translations for different languages.
 * @returns Hover message.
 */
function createHoverMessage(translations: {
  [key: string]: string;
}): vscode.Hover {
  let hoverMessage = `**${EXTENSION_NAME}**\n\n`;
  if (Object.keys(translations).length === 0) {
    return new vscode.Hover(hoverMessage + "No translations found.");
  }

  const icons = ["🌍", "🌐"];
  let iconIndex = 0;
  for (const lang in translations) {
    const icon = iconIndex % 2 === 0 ? icons[0] : icons[1];
    hoverMessage += `${icon} **${lang}**: ${translations[lang]}\n\n`;
  }
  return new vscode.Hover(new vscode.MarkdownString(hoverMessage));
}
