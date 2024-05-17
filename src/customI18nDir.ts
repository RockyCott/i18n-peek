import * as vscode from "vscode";

export let customI18nDir: string | undefined = undefined;

export async function setCustomI18nDir(): Promise<void> {
  const selectedFolder = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "Seleccionar carpeta del directorio i18n",
  });
  if (selectedFolder && selectedFolder.length > 0) {
    const customDir = selectedFolder[0].fsPath;
    if (customDir) {
      customI18nDir = customDir;
      vscode.window.showInformationMessage(
        "Ruta personalizada de directorio i18n configurada con éxito."
      );
    }
  }
}