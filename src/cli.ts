#!/usr/bin/env node

import { cli } from 'cleye';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import packageJSON from '../package.json' assert { type: 'json' };
import { commit } from './commands/commit';
import { commitlintConfigCommand } from './commands/commitlint';
import { configCommand } from './commands/config';
import { hookCommand, isHookCalled } from './commands/githook.js';
import { prepareCommitMessageHook } from './commands/prepare-commit-msg-hook';
import { checkIsLatestVersion } from './utils/checkIsLatestVersion';

const extraArgs = process.argv.slice(2);

cli(
    {
        version: packageJSON.version,
        name: 'gitwz',
        commands: [configCommand, hookCommand, commitlintConfigCommand],
        flags: {},
        ignoreArgv: (type) => type === 'unknown-flag' || type === 'argument',
        help: { description: packageJSON.description },
    },
    async () => {
        await checkIsLatestVersion();

        if (await isHookCalled()) {
            await prepareCommitMessageHook();
        } else {
            await commit(extraArgs);
        }
    },
    extraArgs,
);
