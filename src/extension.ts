'use strict';
import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerCommand('extension.vaultPush', () => {

	}));

	context.subscriptions.push(vscode.commands.registerCommand('extension.vaultPull', () => {

	}));
}

export function deactivate() {
}
