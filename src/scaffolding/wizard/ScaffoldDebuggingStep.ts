/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import { Progress } from 'vscode';
import { AzureWizardExecuteStep } from 'vscode-azureextensionui';
import { DockerDebugScaffoldContext } from '../../debugging/DebugHelper';
import { dockerDebugScaffoldingProvider, NetCoreScaffoldingOptions, NodeScaffoldingOptions, PythonScaffoldingOptions } from '../../debugging/DockerDebugScaffoldingProvider';
import { localize } from '../../localize';
import { unresolveWorkspaceFolder } from '../../utils/resolveVariables';
import { NetCoreScaffoldingWizardContext } from './netCore/NetCoreScaffoldingWizardContext';
import { PythonScaffoldingWizardContext } from './python/PythonScaffoldingWizardContext';
import { ScaffoldingWizardContext } from './ScaffoldingWizardContext';

export class ScaffoldDebuggingStep extends AzureWizardExecuteStep<ScaffoldingWizardContext> {
    public readonly priority: number = 1000;

    public async execute(wizardContext: ScaffoldingWizardContext, progress: Progress<{ message?: string; increment?: number; }>): Promise<void> {
        progress.report({ message: localize('vscode-docker.scaffold.scaffoldDebuggingStep.progress', 'Adding debug configuration and tasks...') });

        const scaffoldContext: DockerDebugScaffoldContext = {
            folder: wizardContext.workspaceFolder,
            actionContext: wizardContext,
            dockerfile: path.join(wizardContext.dockerfileDirectory, 'Dockerfile'),
            ports: wizardContext.ports,
        };

        switch (wizardContext.platform) {
            case 'Node.js':
                scaffoldContext.platform = 'node';
                const nodeOptions: NodeScaffoldingOptions = {
                    package: wizardContext.artifact,
                };
                await dockerDebugScaffoldingProvider.initializeNodeForDebugging(scaffoldContext, nodeOptions);
                break;

            case '.NET: ASP.NET Core':
            case '.NET: Core Console':
                scaffoldContext.platform = 'netCore';
                const netCoreOptions: NetCoreScaffoldingOptions = {
                    appProject: unresolveWorkspaceFolder(wizardContext.artifact, wizardContext.workspaceFolder),
                    platformOS: (wizardContext as NetCoreScaffoldingWizardContext).netCorePlatformOS,
                };
                await dockerDebugScaffoldingProvider.initializeNetCoreForDebugging(scaffoldContext, netCoreOptions);
                break;

            case 'Python: Django':
            case 'Python: Flask':
            case 'Python: General':
                scaffoldContext.platform = 'python';
                const pythonOptions: PythonScaffoldingOptions = {
                    projectType: (wizardContext as PythonScaffoldingWizardContext).pythonProjectType,
                    target: (wizardContext as PythonScaffoldingWizardContext).pythonArtifact,
                };
                await dockerDebugScaffoldingProvider.initializePythonForDebugging(scaffoldContext, pythonOptions);
                break;

            default:
                throw new Error(localize('vscode-docker.scaffold.scaffoldDebuggingStep.invalidPlatform', 'Invalid platform for debug config scaffolding.'));
        }
    }

    public shouldExecute(wizardContext: ScaffoldingWizardContext): boolean {
        switch (wizardContext.platform) {
            case 'Node.js':
            case '.NET: ASP.NET Core':
            case '.NET: Core Console':
            case 'Python: Django':
            case 'Python: Flask':
            case 'Python: General':
                return wizardContext.scaffoldType === 'all' || wizardContext.scaffoldType === 'debugging';

            default:
                return false;
        }
    }
}
