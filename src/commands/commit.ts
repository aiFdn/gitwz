import { confirm, intro, isCancel, multiselect, outro, select, spinner } from '@clack/prompts';
import chalk from 'chalk';
import { execa } from 'execa';

import pkgJson from '../../package.json';
import { generateCommitMessageByDiff } from '../generateCommitMessageFromGitDiff';
import { assertGitRepo, getChangedFiles, getDiff, getStagedFiles, gitAdd } from '../utils/git';
import { trytm } from '../utils/trytm';
import { getConfig } from './config';

const config = getConfig();

const getGitRemotes = async () => {
    const { stdout } = await execa('git', ['remote']);
    return stdout.split('\n').filter((remote) => Boolean(remote.trim()));
};

// Check for the presence of message templates
const checkMessageTemplate = (extraArgs: string[]): string | false => {
    for (const key in extraArgs) {
        if (extraArgs[key].includes(config?.GW_MESSAGE_TEMPLATE_PLACEHOLDER)) return extraArgs[key];
    }
    return false;
};

// eslint-disable-next-line complexity
const generateCommitMessageFromGitDiff = async (diff: string, extraArgs: string[]): Promise<void> => {
    await assertGitRepo();
    const commitSpinner = spinner();
    commitSpinner.start(`${chalk.black.bold.bgBlue(` INFO `)} Generating the commit message...`);

    const startTime = new Date();

    try {
        let commitMessage = await generateCommitMessageByDiff(diff);

        const messageTemplate = checkMessageTemplate(extraArgs);

        if (config?.GW_MESSAGE_TEMPLATE_PLACEHOLDER && typeof messageTemplate === 'string') {
            commitMessage = messageTemplate.replace(config?.GW_MESSAGE_TEMPLATE_PLACEHOLDER, commitMessage);
        }

        const endTime = new Date();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const timeTaken = (endTime - startTime) / 1000;

        commitSpinner.stop(
            `${chalk.bold.black.bgGreen(` SUCCESS `)} ${chalk.black.italic.bgBlue(
                ` Time Taken: ${timeTaken.toFixed(2)} seconds `,
            )}`,
        );

        outro(
            `${chalk.bold.dim('Commit Message Successfully Generated in ' + timeTaken.toFixed(2) + ' seconds')}
${chalk.grey('——————————————————————————————')}
${chalk.bold(commitMessage)}
${chalk.grey('——————————————————————————————')}`,
        );

        const isCommitConfirmedByUser = await confirm({
            message: 'Confirm the commit message?',
        });

        if (isCommitConfirmedByUser && !isCancel(isCommitConfirmedByUser)) {
            const { stdout } = await execa('git', ['commit', '-m', commitMessage, ...extraArgs]);

            outro(`${chalk.bold.black.bgGreen(` SUCCESS `)} Successfully committed changes.`);

            outro(stdout);

            const remotes = await getGitRemotes();

            if (!remotes.length) {
                const { stdout } = await execa('git', ['push']);
                if (stdout) outro(stdout);
                process.exit(0);
            }

            if (remotes.length === 1) {
                const isPushConfirmedByUser = await confirm({
                    message: 'Do you want to run `git push`?',
                });

                if (isPushConfirmedByUser && !isCancel(isPushConfirmedByUser)) {
                    const pushSpinner = spinner();

                    pushSpinner.start(
                        `${chalk.black.bold.bgBlue(` INFO `)} Running ${chalk.black.bold.bgBlue(
                            ` git push ${remotes[0]} `,
                        )}`,
                    );

                    const { stdout } = await execa('git', ['push', '--verbose', remotes[0]]);

                    pushSpinner.stop(
                        `${chalk.black.bold.bgGreen(
                            ` SUCCESS `,
                        )} Successfully pushed all commits to ${chalk.bold.black.bgGreen(` ${remotes[0]} `)}.`,
                    );

                    // eslint-disable-next-line max-depth
                    if (stdout) outro(stdout);
                } else {
                    outro(`${chalk.black.bold.bgYellow(` WARNING `)} 'git push' aborted - Operation cancelled.`);
                    process.exit(0);
                }
            } else {
                const selectedRemote = (await select({
                    message: 'Choose a remote to push to',
                    options: remotes.map((remote) => ({ value: remote, label: remote })),
                })) as string;

                if (!isCancel(selectedRemote)) {
                    const pushSpinner = spinner();

                    pushSpinner.start(
                        `${chalk.black.bold.bgBlue(` INFO `)} Running ${chalk.black.bold.bgBlue(
                            ` git push ${selectedRemote} `,
                        )}`,
                    );

                    const { stdout } = await execa('git', ['push', selectedRemote]);

                    pushSpinner.stop(
                        `${chalk.black.bold.bgGreen(
                            ` SUCCESS `,
                        )} Successfully pushed all commits to ${chalk.bold.black.bgGreen(` ${selectedRemote} `)}.`,
                    );

                    // eslint-disable-next-line max-depth
                    if (stdout) outro(stdout);
                } else outro(`${chalk.black.bold.bgGray(` WARNING `)} process cancelled`);
            }
        } else {
            outro(
                `${chalk.black.bold.bgYellow(
                    ` WARNING `,
                )} Commit Aborted - The commit message was not confirmed. Operation cancelled.`,
            );
            process.exit(0);
        }
    } catch (error) {
        commitSpinner.stop(`${chalk.black.bold.bgBlue(` INFO `)} Commit message generated.`);

        const err = error as Error;
        outro(`${chalk.white.bold.bgRed(` ERROR `)} ${err?.message || err}`);
        process.exit(1);
    }
};

// eslint-disable-next-line complexity
export async function commit(extraArgs: string[] = [], isStageAllFlag: boolean = false) {
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

    const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles());
    const [changedFiles, errorChangedFiles] = await trytm(getChangedFiles());

    if (!changedFiles?.length && !stagedFiles?.length) {
        outro(
            chalk.hex('#FFA500')(
                `${chalk.bold.inverse.hex('#FFA500')(
                    ` WARNING `,
                )} No changes detected, write some code and run 'gw' again`,
            ),
        );
        process.exit(1);
    }

    intro(`
${chalk.bold.inverse.hex('#FFA500')(` GitWiz ${pkgJson.version} `)}${chalk.italic.dim(
        ` Use AI to Enhance Your Git Commits `,
    )}
${chalk.inverse.bold.hex('#45CFDD')(` Developed By `)} ${chalk.bold('Md. Sazzad Hossain Sharkar')} (${chalk.underline(
        'https://github.com/SHSharkar',
    )})
    
${chalk.yellow('Preparing to commit changes...')}`);

    if (errorChangedFiles ?? errorStagedFiles) {
        outro(`${chalk.white.bold.bgRed(` ERROR `)} ${errorChangedFiles ?? errorStagedFiles}`);
        process.exit(1);
    }

    const stagedFilesSpinner = spinner();

    stagedFilesSpinner.start('Counting staged files...');

    if (!stagedFiles.length) {
        stagedFilesSpinner.stop(`${chalk.bold.black.bgBlue(` INFO `)} No staged files found.`);
        const isStageAllAndCommitConfirmedByUser = await confirm({
            message: 'Do you want to stage all files and generate commit message?',
        });

        if (isStageAllAndCommitConfirmedByUser && !isCancel(isStageAllAndCommitConfirmedByUser)) {
            await commit(extraArgs, true);
            process.exit(1);
        }

        if (stagedFiles.length === 0 && changedFiles.length > 0) {
            const files = (await multiselect({
                message: chalk.bold(`Select files to stage:`),
                options: changedFiles.map((file) => ({
                    value: file,
                    label: file,
                })),
            })) as string[];

            if (isCancel(files)) process.exit(1);

            await gitAdd({ files });
        }

        await commit(extraArgs, false);
        process.exit(1);
    }

    stagedFilesSpinner.stop(
        `${chalk.bold.black.bgBlue(` ${stagedFiles.length} file(s) were staged. `)}\n${stagedFiles
            .map((file, index) =>
                stagedFiles.length > 1 ? `  ${chalk.dim(`${index + 1}. ${file}`)}` : `  ${chalk.dim(file)}`,
            )
            .join('\n')}`,
    );

    const [, generateCommitError] = await trytm(
        generateCommitMessageFromGitDiff(await getDiff({ files: stagedFiles }), extraArgs),
    );

    if (generateCommitError) {
        outro(`${chalk.white.bold.bgRed(` ERROR `)} ${generateCommitError}`);
        process.exit(1);
    }

    process.exit(0);
}
