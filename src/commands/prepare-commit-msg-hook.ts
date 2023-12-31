import { intro, outro, spinner } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs/promises';

import { generateCommitMessageByDiff } from '../generateCommitMessageFromGitDiff';
import { getChangedFiles, getDiff, getStagedFiles, gitAdd } from '../utils/git';
import { getConfig } from './config';

const [messageFilePath, commitSource] = process.argv.slice(2);

export const prepareCommitMessageHook = async (isStageAllFlag: boolean = false) => {
    try {
        if (!messageFilePath) {
            throw new Error(
                'Commit message file path is missing. This file should be called from the "prepare-commit-msg" git hook',
            );
        }

        if (commitSource) return;

        if (isStageAllFlag) {
            const changedFiles = await getChangedFiles();

            if (changedFiles) await gitAdd({ files: changedFiles });
            else {
                outro(
                    chalk.hex('#FFA500')(
                        `${chalk.bold.inverse.hex('#FFA500')(
                            ` WARNING `,
                        )} No changes detected, write some code and run 'gw' again`,
                    ),
                );
                process.exit(1);
            }
        }

        const staged = await getStagedFiles();

        if (!staged) return;

        intro('gitwz');

        const config = getConfig();

        if (!config?.GW_OPENAI_API_KEY) {
            throw new Error('No OPEN_AI_API exists. Set your OPEN_AI_API=<key> in ~/.gitwz');
        }

        const spin = spinner();
        spin.start('Generating commit message');

        const commitMessage = await generateCommitMessageByDiff(await getDiff({ files: staged }));
        spin.stop('Done');

        const fileContent = await fs.readFile(messageFilePath);

        await fs.writeFile(messageFilePath, commitMessage + '\n' + fileContent.toString());
    } catch (error) {
        outro(`${chalk.red('✖')} ${error}`);
        process.exit(1);
    }
};
