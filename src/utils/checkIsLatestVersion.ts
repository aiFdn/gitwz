import { outro } from '@clack/prompts';
import chalk from 'chalk';

import currentPackage from '../../package.json';
import { getGitWizLatestVersion } from '../api';

export const checkIsLatestVersion = async () => {
    const latestVersion = await getGitWizLatestVersion();
    const currentVersion = currentPackage.version;

    if (latestVersion && currentVersion !== latestVersion) {
        outro(
            `${chalk.bold.blue('INFO:')} You are currently using GitWiz version ${chalk.bold(currentVersion)}. 
${chalk.bold.green('UPDATE AVAILABLE:')} The latest stable version is ${chalk.bold(latestVersion)}. 
To update, run: ${chalk.bold.cyan('npm i -g gitwz@latest')}.`,
        );
    } else {
        outro(
            `${chalk.bold.blue('INFO:')} You are currently using GitWiz version ${chalk.bold(currentVersion)}. 
This is the latest available version.`,
        );
    }
};
