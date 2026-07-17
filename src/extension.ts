import * as vscode from "vscode";
import { GitHubVsixUpdateManager } from "./vendor/githubUpdater";

export function activate(context: vscode.ExtensionContext): void {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = "$(replace) 执行替换";
  statusBarItem.tooltip = "点击批量替换当前文件中的字符串";
  statusBarItem.command = "stringReplacer.replace";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  const disposable = vscode.commands.registerCommand(
    "stringReplacer.replace",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("未检测到可编辑的文件");
        return;
      }

      const config = vscode.workspace.getConfiguration("stringReplacer");
      const replacements: Record<string, string> =
        config.get("replacements") || {};
      const trimTrailingSpaces: boolean =
        config.get("trimTrailingSpaces") || false;

      const document = editor.document;
      const fullText = document.getText();

      if (Object.keys(replacements).length === 0) {
        vscode.window.showInformationMessage("替换规则为空");
        return;
      }

      let newText = fullText;
      let replaced = false;

      for (const [from, to] of Object.entries(replacements)) {
        if (!from) continue;
        const reg = new RegExp(
          from.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1"),
          "g"
        );
        if (!reg.test(newText)) continue;
        replaced = true;
        newText = newText.replace(reg, to);
      }

      if (trimTrailingSpaces) {
        newText = newText.replace(/[ \t]+$/gm, "");
      }

      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(fullText.length)
      );

      editor
        .edit((editBuilder) => {
          editBuilder.replace(fullRange, newText);
        })
        .then((success) => {
          if (success) {
            vscode.window.showInformationMessage("字符串替换完成 ✅");
          } else {
            vscode.window.showErrorMessage("替换失败 ❌");
          }
        });
    }
  );

  context.subscriptions.push(disposable);

  const configuredHours = vscode.workspace.getConfiguration("stringReplacer.autoUpdate").get<number>("checkIntervalHours", 24);
  const checkIntervalMs = Math.max(1, Number.isFinite(configuredHours) ? configuredHours : 24) * 60 * 60 * 1000;
  const updateManager = new GitHubVsixUpdateManager(context, {
    owner: "HengXin666",
    repo: "vscode-string-replacer",
    displayName: "字符串替换器",
    stateKeyPrefix: "stringReplacer.updater",
    assetPattern: /^string-replacer-.*\.vsix$/i,
    checkIntervalMs
  });
  context.subscriptions.push(updateManager);

  const syncAutomaticChecks = (): void => {
    const enabled = vscode.workspace.getConfiguration("stringReplacer.autoUpdate").get<boolean>("enabled", true);
    updateManager.setAutomaticChecksEnabled(enabled);
  };
  syncAutomaticChecks();

  context.subscriptions.push(
    vscode.commands.registerCommand("stringReplacer.checkForUpdates", () => updateManager.checkForUpdates({ manual: true })),
    vscode.commands.registerCommand("stringReplacer.reloadAllWindows", () => updateManager.requestReloadAllWindows()),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("stringReplacer.autoUpdate")) {
        syncAutomaticChecks();
      }
    })
  );
}

export function deactivate(): void {}
