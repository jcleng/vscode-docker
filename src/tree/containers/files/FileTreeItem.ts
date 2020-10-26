import * as vscode from 'vscode';
import { AzExtParentTreeItem } from 'vscode-azureextensionui';
import { DockerUri } from '../../../docker/files/DockerUri2';
import { AzExtTreeItemIntermediate } from '../../AzExtTreeItemIntermediate';

export class FileTreeItem extends AzExtTreeItemIntermediate {
    public id?: string;
    public description?: string = '';

    public constructor(
        parent: AzExtParentTreeItem,
        private readonly name: string,
        public readonly uri: DockerUri) {
        super(parent);
    }

    public get contextValue(): string {
        return 'containerFile';
    }

    public get iconPath(): vscode.ThemeIcon {
        return new vscode.ThemeIcon('file');
    }

    public get label(): string {
        return this.name;
    }
}
