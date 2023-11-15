import chalk from 'chalk';

import { outro } from '@clack/prompts';

import currentPackage from '../../package.json';
import { getGitWizLatestVersion } from '../api';

export const checkIsLatestVersion = async () => {
    const latestVersion = await getGitWizLatestVersion();

    if (latestVersion) {
        const currentVersion = currentPackage.version;

        if (currentVersion !== latestVersion) {
            outro(
                chalk.yellow(
                    `
You are not using the latest stable version of GitWiz with new features and bug fixes.
Current version: ${currentVersion}. Latest version: ${latestVersion}.
🚀 To update run: npm i -g gitwz@latest.
        `,
                ),
            );
        }
    }
};
