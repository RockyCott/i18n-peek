import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getWorkspaceI18nCustomDir, validateI18nDirToAbsolute } from "./i18nDirManager";
import { flatten } from "./json-util";
import { normalizeText } from "./text-util";
import { I18N_PEEK_DIR, ensureI18nPeekDirExists } from "./i18nRemoteConfig";
import { EXTENSION_NAME } from "./extension";

export async function searchText() {
  try {
    const editor = vscode.window.activeTextEditor;
    const selectedText = editor
      ? editor.document.getText(editor.selection)
      : "";
    // Open input box to enter a string
    const inputText = await vscode.window.showInputBox({
      prompt: "Enter a string to search for similar values",
      value: selectedText || "",
    });

    if (!inputText) {
      return;
    }
    const editText = normalizeText(inputText, false, "lower");
    const results = await search(editText);

    if (!results) {
      vscode.window.showInformationMessage(
        `${EXTENSION_NAME}: No results found.`
      );
      return;
    }

    // Create a new json document in .i18nPeek to show the results
    await ensureI18nPeekDirExists();

    const filePath = path.join(I18N_PEEK_DIR, "search-results.json");
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);
  } catch (error) {
    console.error("Error searching text:", error);
    vscode.window.showErrorMessage(
      `${EXTENSION_NAME}: Error searching text. See console for details.`
    );
  }
}

/**
 * Function to search a value in the i18n files
 * @param text - Value to search
 */
async function search(text: string): Promise<any> {
  if (!text) {
    return null;
  }

  let finalResults: any = {};
  const i18nDir = getWorkspaceI18nCustomDir();
  const i18nAbsoluteDir = validateI18nDirToAbsolute(i18nDir);
  // Check if the i18n directory exists
  if (!fs.existsSync(i18nAbsoluteDir)) {
    vscode.window.showErrorMessage(
      `${EXTENSION_NAME}: i18n directory not found.`
    );
    return null;
  }

  const files = fs
    .readdirSync(i18nAbsoluteDir)
    .filter((file) => file.endsWith(".json"));
  for (const file of files) {
    const filePath = path.join(i18nAbsoluteDir, file);
    const jsonContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(jsonContent);
    const flattenedJson = flatten(jsonData);
    const results = searchInJson(flattenedJson, text);
    if (Object.keys(results).length) {
      finalResults = { ...finalResults, ...results };
    }
  }
  return Object.keys(finalResults).length ? finalResults : null;
}

/**
 * Function to search a value in a JSON object
 * @param json - JSON object
 * @param value - Value to search
 * @returns - Set of keys that contain the value
 */
function searchInJson(json: any, text: string): any {
  const results: any = {};
  for (const key in json) {
    const value = normalizeText(json[key], false, "lower");
    if (value.includes(text)) {
      results[key] = json[key];
    }
  }
  return results;
}
