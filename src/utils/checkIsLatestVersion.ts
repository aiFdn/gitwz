import { outro } from '@clack/prompts';
import chalk from 'chalk';

import currentPackage from '../../package.json';
import { getGitWizLatestVersion } from '../api';

export const checkIsLatestVersion = async () => {
    const latestVersion = await getGitWizLatestVersion();
    const currentVersion = currentPackage.version;

    if (latestVersion && currentVersion !== latestVersion) {
        outro(
            `You're currently using GitWiz ${chalk.bold.inverse.hex('#1640D6')(
                ` v${currentVersion} `,
            )}. An update to ${chalk.bold.inverse.hex('#54B435')(
                ` v${latestVersion} `,
            )} is available. Update by typing: ${chalk.bold.black.bgCyan(` npm i -g gitwz@latest `)}.`,
        );
    } else {
        outro(`You're now using the latest version of GitWiz, ${chalk.bold.black.bgGreen(` v${currentVersion} `)}.`);
    }
};
