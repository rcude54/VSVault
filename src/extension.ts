'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as xml2js from 'xml2js';
import { exec } from 'child_process';
import { format } from 'util';

let localInfo = {
	host: '',
	port: '',
	credentials: ''
};
let vaultPath = '';
let tmpVaultPath = '/tmp/vsvault/'
let extPath = '';
let jcrPath = '';
let tmpJcrRoot = '';
let vaultMetaFolder = '';

export function activate(context: vscode.ExtensionContext) {

	let config = vscode.workspace.getConfiguration();
	vaultPath = config.get('vsvault.vaultLocation', '') + '/vlt';
	localInfo.host = config.get('vsvault.host', 'localhost');
	localInfo.port = config.get('vsvault.port', '4502');
	localInfo.credentials = config.get('vsvault.credentials', 'admin:admin');
	extPath  = context.extensionPath;

    context.subscriptions.push(vscode.commands.registerCommand('extension.vaultPush', (fileUri) => {
		let path = fileUri.path;
		let metaPath = `${tmpVaultPath}META-INF/vault/`;
		setPathVars(path);

		//Creates import file tructure for pushing(importing)
		fs.copySync(path, tmpJcrRoot);
		fs.copySync(vaultMetaFolder, metaPath);

		let filterObject = {
			'workspaceFilter': {
				$: {
					'vesion': '1.0'
				},
				filter : {
					$: {
						'root': jcrPath
						}
				}
			}
		};

		let builder = new xml2js.Builder();
    	let filterXML = builder.buildObject(filterObject);
		fs.outputFile(`${metaPath}filter.xml`, filterXML, vaultPush);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('extension.vaultPull', (fileUri) => {
		let path = fileUri.path;
		setPathVars(path);

		vaultPull(jcrPath, function(){
			fs.copySync(tmpJcrRoot, path);
			vscode.window.showInformationMessage('Your content has been successfully pulled from the JCR!');
			fs.remove(tmpVaultPath);
		});

	}));
}

function vaultPush(){
	//Need to make working directory /src for vault tool to work properly
	exec(`cd ${extPath} && ${vaultPath} -v --credentials ${localInfo.credentials} import http://${localInfo.host}:${localInfo.port}/crx ${tmpVaultPath} /`, (err, stdout, stderr) => {
		if (err) {
			console.error(`exec error: ${err}`);
			return;
		}

		vscode.debug.activeDebugConsole.appendLine(format(stdout));
		vscode.window.showInformationMessage('Your content has been successfully pushed to the JCR!');
		fs.remove(tmpVaultPath);
	});
}

function vaultPull(path: string, cb: () => void){
	//Need to make working directory /src for vault tool to work properly
	exec(`cd ${extPath} && ${vaultPath} -v --credentials ${localInfo.credentials} export http://${localInfo.host}:${localInfo.port}/crx ${path} ${tmpVaultPath}`, (err, stdout, stderr) => {
		if (err) {
			console.error(`exec error: ${err}`);
			return;
		}

		vscode.debug.activeDebugConsole.appendLine(format(stdout));
		cb();
	});
}

function setPathVars(path: string) {
	if(path.indexOf('jcr_root') <= 1) {
		vscode.window.showInformationMessage('Folder selected needs to be under the jcr_content directory');
		throw new Error('Invalid jcr path!');
	}
	jcrPath = path.substring(path.indexOf('jcr_root')+8);
	vaultMetaFolder = `${path.substring(0, path.indexOf('jcr_root'))}META-INF/vault/`;
	//Extension relative paths
	tmpJcrRoot = `${tmpVaultPath}jcr_root${jcrPath}`;
}

export function deactivate() {
}
