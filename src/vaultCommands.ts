import * as vscode from 'vscode';
import { exec } from 'child_process';
import { format } from 'util';
import * as fs from 'fs-extra';
import * as global from './global';

let local = global.default.localInfo;

export function vaultPush(){
    //Need to make working directory /src for vault tool to work properly
    exec(`cd ${global.default.extPath} && ${global.default.vaultPath} -v --credentials ${local.credentials} import http://${local.host}:${local.port}/crx ${global.default.tmpVaultPath} /`, (err, stdout, stderr) => {
        if (err) {
            vscode.window.showInformationMessage(`Error occured while running vault command: ${err}`);
            return;
        }

        vscode.window.showInformationMessage('Your content has been successfully pushed to the JCR!');
        fs.remove(global.default.tmpVaultPath);
    });
}

export function vaultPull(path: string, cb: () => void){
    //Need to make working directory /src for vault tool to work properly
    exec(`cd ${global.default.extPath} && ${global.default.vaultPath} -v --credentials ${local.credentials} export http://${local.host}:${local.port}/crx ${path} ${global.default.tmpVaultPath}`, (err, stdout, stderr) => {
        if (err) {
            vscode.debug.activeDebugConsole.appendLine(`Error occured while running vault command: ${err}`);
            return;
        }

        vscode.debug.activeDebugConsole.appendLine(format(stdout));
        cb();
    });
}
