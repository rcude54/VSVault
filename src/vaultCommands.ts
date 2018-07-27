import * as vscode from 'vscode';
import { exec } from 'child_process';
import { format } from 'util';
import * as fs from 'fs-extra';
import * as constants from './constants';

let local = constants.default.localInfo;

export function vaultPush(){
    //Need to make working directory /src for vault tool to work properly
    exec(`cd ${constants.default.extPath} && ${constants.default.vaultPath} -v --credentials ${local.credentials} import http://${local.host}:${local.port}/crx ${constants.default.tmpVaultPath} /`, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return;
        }

        vscode.debug.activeDebugConsole.appendLine(format(stdout));
        vscode.window.showInformationMessage('Your content has been successfully pushed to the JCR!');
        fs.remove(constants.default.tmpVaultPath);
    });
}

export function vaultPull(path: string, cb: () => void){
    //Need to make working directory /src for vault tool to work properly
    exec(`cd ${constants.default.extPath} && ${constants.default.vaultPath} -v --credentials ${local.credentials} export http://${local.host}:${local.port}/crx ${path} ${constants.default.tmpVaultPath}`, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return;
        }

        vscode.debug.activeDebugConsole.appendLine(format(stdout));
        cb();
    });
}
