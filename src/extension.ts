import * as vscode from "vscode";
import {
  activate as activateHoverProvider,
  deactivate as deactivateHoverProvider,
} from "./hoverProvider";
import { setCustomI18nDir } from "./customI18nDir";

export function activate(context: vscode.ExtensionContext) {
  // Registrar el comando para configurar la ruta personalizada de i18n Helper
  context.subscriptions.push(
    vscode.commands.registerCommand("i18nHelper.setCustomI18nDir", () => {
      setCustomI18nDir();
    })
  );

  // Activar el proveedor de hover
  activateHoverProvider(context);
}

export function deactivate() {
  deactivateHoverProvider();
}
