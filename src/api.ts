import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';
import { intro, outro } from '@clack/prompts';
import axios from 'axios';
import chalk from 'chalk';
import { execa } from 'execa';
import OpenAI, { AzureOpenAI } from 'openai';

import { CONFIG_MODES, DEFAULT_MODEL_TOKEN_LIMIT, getConfig } from './commands/config';
import { GenerateCommitMessageErrorEnum } from './generateCommitMessageFromGitDiff';
import { tokenCount } from './utils/tokenCount';

const config = getConfig();

const maxTokens = config?.GW_OPENAI_MAX_TOKENS || 500;
const apiKey = config?.GW_OPENAI_API_KEY;
const MODEL = config?.GW_MODEL || 'gpt-4o-mini';

const [command, mode] = process.argv.slice(2);

if (!apiKey && !config?.GW_AZURE_OPENAI_API_KEY && command !== 'config' && mode !== CONFIG_MODES.set) {
    intro('gitwz');
    outro(
        'Neither GW_OPENAI_API_KEY nor GW_AZURE_OPENAI_API_KEY is set. Please run `gw config set` to configure your API keys.',
    );
    outro('For help look into README https://github.com/aiFdn/gitwz#setup');
    process.exit(1);
}

let openai: OpenAI | AzureOpenAI;

if (config?.GW_USE_AZURE_OPENAI === 'true') {
    const scope = 'https://cognitiveservices.azure.com/.default';
    const azureADTokenProvider = getBearerTokenProvider(new DefaultAzureCredential(), scope);
    const deployment = config.GW_AZURE_OPENAI_DEPLOYMENT_NAME as string;
    const apiVersion = '2024-07-01-preview';
    openai = new AzureOpenAI({ azureADTokenProvider, deployment, apiVersion });
} else {
    openai = new OpenAI({
        apiKey: apiKey,
    });
}

class OpenAi {
    constructor() {}

    public generateCommitMessage = async (
        messages: (
            | OpenAI.Chat.ChatCompletionSystemMessageParam
            | OpenAI.Chat.ChatCompletionUserMessageParam
            | OpenAI.Chat.ChatCompletionAssistantMessageParam
            | OpenAI.Chat.ChatCompletionToolMessageParam
            | OpenAI.Chat.ChatCompletionFunctionMessageParam
            | OpenAI.Chat.ChatCompletionCreateParamsNonStreaming
            | OpenAI.Chat.ChatCompletionCreateParamsStreaming
            | {
                  role: string;
                  content: string;
              }
        )[],
    ): Promise<string | null | undefined> => {
        const params = {
            model: MODEL,
            messages,
            temperature: 0,
            top_p: 0.1,
            max_tokens: maxTokens,
        };

        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const REQUEST_TOKENS = messages.map((msg) => tokenCount(msg.content) + 4).reduce((a, b) => a + b, 0);

            if (REQUEST_TOKENS > DEFAULT_MODEL_TOKEN_LIMIT - maxTokens) {
                throw new Error(GenerateCommitMessageErrorEnum.tooMuchTokens);
            }

            let response;
            if (config?.GW_USE_AZURE_OPENAI === 'true') {
                response = await (openai as AzureOpenAI).chat.completions.create(params);
            } else {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                response = await (openai as OpenAI).chat.completions.create(params);
            }

            const message = response.choices[0].message;

            return message?.content;
        } catch (error) {
            outro(`${chalk.red('✖')} ${JSON.stringify(params)}`);

            const err = error as Error;
            outro(`${chalk.red('✖')} ${err?.message || err}`);

            if (axios.isAxiosError<{ error?: { message: string } }>(error) && error.response?.status === 401) {
                const openAiError = error.response.data.error;

                if (openAiError?.message) outro(openAiError.message);
                outro('For help look into README https://github.com/aiFdn/gitwz#setup');
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
