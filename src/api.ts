import { intro, outro } from '@clack/prompts';
import axios from 'axios';
import chalk from 'chalk';
import { execa } from 'execa';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

import { CONFIG_MODES, DEFAULT_MODEL_TOKEN_LIMIT, getConfig } from './commands/config';
import { GenerateCommitMessageErrorEnum } from './generateCommitMessageFromGitDiff';
import { tokenCount } from './utils/tokenCount';

const config = getConfig();

const maxTokens = config?.GWZ_OPENAI_MAX_TOKENS || 500;
const apiKey = config?.GWZ_OPENAI_API_KEY;
const MODEL = config?.GWZ_MODEL || 'gpt-3.5-turbo-1106';

const [command, mode] = process.argv.slice(2);

if (!apiKey && command !== 'config' && mode !== CONFIG_MODES.set) {
    intro('gitwz');
    outro(
        'GWZ_OPENAI_API_KEY is not set, please run `gwz config set GWZ_OPENAI_API_KEY=<your token>. Make sure you add payment details, so API works.`',
    );
    outro('For help look into README https://github.com/SHSharkar/gitwz#setup');
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: apiKey,
});

class OpenAi {
    constructor() {}

    public generateCommitMessage = async (
        messages: Array<ChatCompletionMessageParam>,
    ): Promise<string | null | undefined> => {
        const params = {
            model: MODEL,
            messages,
            temperature: 0,
            top_p: 0.1,
            max_tokens: maxTokens,
        };

        try {
            const REQUEST_TOKENS = messages.map((msg) => tokenCount(msg.content) + 4).reduce((a, b) => a + b, 0);

            if (REQUEST_TOKENS > DEFAULT_MODEL_TOKEN_LIMIT - maxTokens) {
                throw new Error(GenerateCommitMessageErrorEnum.tooMuchTokens);
            }

            const response = await openai.chat.completions.create(params);

            const message = response.choices[0].message;

            if (config?.GWZ_ONE_LINE_COMMIT) {
                const { choices: oneLineData } = await openai.chat.completions.create({
                    ...params,
                    messages: [
                        {
                            role: 'system',
                            content:
                                "Commit messages should be concise and informative, starting with a description under 50 characters followed by a detailed section outlining significant changes. AI prompts need full codebase access and should be updated with the latest code changes. Summaries should be clear and to the point, while descriptions should explain the changes' purpose, impact, and necessity. The AI is expected to thoroughly review the code, identifying major updates, refactors, fixes, or deletions. All file modifications should be consolidated into a single commit message, focusing on critical updates without referencing multiple or inconsistent lines. Before finalizing, ensure the accuracy of messages against the code changes.",
                        },
                        {
                            role: 'user',
                            content: `Here are commits messages:\n${message?.content}`,
                        },
                    ],
                });

                const oneLineMessage = oneLineData[0].message;
                return oneLineMessage?.content;
            }

            return message?.content;
        } catch (error) {
            outro(`${chalk.red('✖')} ${JSON.stringify(params)}`);

            const err = error as Error;
            outro(`${chalk.red('✖')} ${err?.message || err}`);

            if (axios.isAxiosError<{ error?: { message: string } }>(error) && error.response?.status === 401) {
                const openAiError = error.response.data.error;

                if (openAiError?.message) outro(openAiError.message);
                outro('For help look into README https://github.com/SHSharkar/gitwz#setup');
            }

            throw err;
        }
    };
}

export const getGitWizLatestVersion = async (): Promise<string | undefined> => {
    try {
        const { stdout } = await execa('npm', ['view', 'gitwz', 'version']);
        return stdout;
    } catch (_) {
        outro('Error while getting the latest version of gitwz');
        return undefined;
    }
};

export const api = new OpenAi();
