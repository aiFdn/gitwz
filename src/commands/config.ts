import { intro, outro } from '@clack/prompts';
import chalk from 'chalk';
import { command } from 'cleye';
import * as dotenv from 'dotenv';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { parse as iniParse, stringify as iniStringify } from 'ini';
import { homedir } from 'os';
import { join as pathJoin } from 'path';

import { COMMANDS } from '../CommandsEnum';
import { getI18nLocal } from '../i18n';

dotenv.config();

export enum CONFIG_KEYS {
    GWZ_OPENAI_API_KEY = 'GWZ_OPENAI_API_KEY',
    GWZ_OPENAI_MAX_TOKENS = 'GWZ_OPENAI_MAX_TOKENS',
    GWZ_OPENAI_BASE_PATH = 'GWZ_OPENAI_BASE_PATH',
    GWZ_DESCRIPTION = 'GWZ_DESCRIPTION',
    GWZ_EMOJI = 'GWZ_EMOJI',
    GWZ_MODEL = 'GWZ_MODEL',
    GWZ_LANGUAGE = 'GWZ_LANGUAGE',
    GWZ_MESSAGE_TEMPLATE_PLACEHOLDER = 'GWZ_MESSAGE_TEMPLATE_PLACEHOLDER',
    GWZ_PROMPT_MODULE = 'GWZ_PROMPT_MODULE',
    GWZ_ONE_LINE_COMMIT = 'GWZ_ONE_LINE_COMMIT',
}

export const DEFAULT_MODEL_TOKEN_LIMIT = 4096;

export enum CONFIG_MODES {
    get = 'get',
    set = 'set',
}

const validateConfig = (key: string, condition: any, validationMessage: string) => {
    if (!condition) {
        outro(`${chalk.red('✖')} Unsupported config key ${key}: ${validationMessage}`);

        process.exit(1);
    }
};

export const configValidators = {
    [CONFIG_KEYS.GWZ_OPENAI_API_KEY](value: any, config: any = {}) {
        validateConfig(CONFIG_KEYS.GWZ_OPENAI_API_KEY, value, 'Cannot be empty');
        validateConfig(CONFIG_KEYS.GWZ_OPENAI_API_KEY, value.startsWith('sk-'), 'Must start with "sk-"');
        validateConfig(
            CONFIG_KEYS.GWZ_OPENAI_API_KEY,
            config[CONFIG_KEYS.GWZ_OPENAI_BASE_PATH] || value.length === 51,
            'Must be 51 characters long',
        );

        return value;
    },

    [CONFIG_KEYS.GWZ_DESCRIPTION](value: any) {
        validateConfig(CONFIG_KEYS.GWZ_DESCRIPTION, typeof value === 'boolean', 'Must be true or false');

        return value;
    },

    [CONFIG_KEYS.GWZ_OPENAI_MAX_TOKENS](value: any) {
        // If the value is a string, convert it to a number.
        if (typeof value === 'string') {
            value = parseInt(value);
            validateConfig(CONFIG_KEYS.GWZ_OPENAI_MAX_TOKENS, !isNaN(value), 'Must be a number');
        }
        validateConfig(
            CONFIG_KEYS.GWZ_OPENAI_MAX_TOKENS,
            value ? typeof value === 'number' : undefined,
            'Must be a number',
        );

        return value;
    },

    [CONFIG_KEYS.GWZ_EMOJI](value: any) {
        validateConfig(CONFIG_KEYS.GWZ_EMOJI, typeof value === 'boolean', 'Must be true or false');

        return value;
    },

    [CONFIG_KEYS.GWZ_LANGUAGE](value: any) {
        validateConfig(CONFIG_KEYS.GWZ_LANGUAGE, getI18nLocal(value), `${value} is not supported yet`);
        return getI18nLocal(value);
    },

    [CONFIG_KEYS.GWZ_OPENAI_BASE_PATH](value: any) {
        validateConfig(CONFIG_KEYS.GWZ_OPENAI_BASE_PATH, typeof value === 'string', 'Must be string');
        return value;
    },

    [CONFIG_KEYS.GWZ_MODEL](value: any) {
        validateConfig(
            CONFIG_KEYS.GWZ_MODEL,
            [
                'gpt-4-1106-preview',
                'gpt-4',
                'gpt-4-0613',
                'gpt-4-0314',
                'gpt-3.5-turbo-1106',
                'gpt-3.5-turbo',
                'gpt-3.5-turbo-0613',
                'gpt-3.5-turbo-0301',
            ].includes(value),
            `${value} is not supported yet, use 'gpt-4-1106-preview','gpt-4','gpt-4-0613','gpt-4-0314','gpt-3.5-turbo-1106','gpt-3.5-turbo','gpt-3.5-turbo-0613','gpt-3.5-turbo-0301'`,
        );
        return value;
    },
    [CONFIG_KEYS.GWZ_MESSAGE_TEMPLATE_PLACEHOLDER](value: any) {
        validateConfig(
            CONFIG_KEYS.GWZ_MESSAGE_TEMPLATE_PLACEHOLDER,
            value.startsWith('$'),
            `${value} must start with $, for example: '$msg'`,
        );
        return value;
    },

    [CONFIG_KEYS.GWZ_PROMPT_MODULE](value: any) {
        validateConfig(
            CONFIG_KEYS.GWZ_PROMPT_MODULE,
            ['conventional-commit', '@commitlint'].includes(value),
            `${value} is not supported yet, use '@commitlint' or 'conventional-commit' (default)`,
        );

        return value;
    },

    [CONFIG_KEYS.GWZ_ONE_LINE_COMMIT](value: any) {
        validateConfig(CONFIG_KEYS.GWZ_ONE_LINE_COMMIT, typeof value === 'boolean', 'Must be true or false');

        return value;
    },
};

export type ConfigType = {
    [key in CONFIG_KEYS]?: any;
};

const configPath = pathJoin(homedir(), '.gitwz');

export const getConfig = (): ConfigType | null => {
    const configFromEnv = {
        GWZ_OPENAI_API_KEY: process.env.GWZ_OPENAI_API_KEY,
        GWZ_OPENAI_MAX_TOKENS: process.env.GWZ_OPENAI_MAX_TOKENS
            ? Number(process.env.GWZ_OPENAI_MAX_TOKENS)
            : undefined,
        GWZ_OPENAI_BASE_PATH: process.env.GWZ_OPENAI_BASE_PATH,
        GWZ_DESCRIPTION: process.env.GWZ_DESCRIPTION === 'true' ? true : false,
        GWZ_EMOJI: process.env.GWZ_EMOJI === 'true' ? true : false,
        GWZ_MODEL: process.env.GWZ_MODEL || 'gpt-3.5-turbo-1106',
        GWZ_LANGUAGE: process.env.GWZ_LANGUAGE || 'en',
        GWZ_MESSAGE_TEMPLATE_PLACEHOLDER: process.env.GWZ_MESSAGE_TEMPLATE_PLACEHOLDER || '$msg',
        GWZ_PROMPT_MODULE: process.env.GWZ_PROMPT_MODULE || 'conventional-commit',
        GWZ_ONE_LINE_COMMIT: process.env.GWZ_ONE_LINE_COMMIT === 'true' ? true : false,
    };

    const configExists = existsSync(configPath);
    if (!configExists) return configFromEnv;

    const configFile = readFileSync(configPath, 'utf8');
    const config = iniParse(configFile);

    for (const configKey of Object.keys(config)) {
        if (!config[configKey] || ['null', 'undefined'].includes(config[configKey])) {
            config[configKey] = undefined;
            continue;
        }
        try {
            const validator = configValidators[configKey as CONFIG_KEYS];
            const validValue = validator(config[configKey] ?? configFromEnv[configKey as CONFIG_KEYS], config);

            config[configKey] = validValue;
        } catch (error) {
            outro(
                `'${configKey}' name is invalid, it should be either 'GWZ_${configKey.toUpperCase()}' or it doesn't exist.`,
            );
            outro(`Manually fix the '.env' file or global '~/.gitwz' config file.`);
            process.exit(1);
        }
    }

    return config;
};

export const setConfig = (keyValues: [key: string, value: string][]) => {
    const config = getConfig() || {};

    for (const [configKey, configValue] of keyValues) {
        if (!configValidators.hasOwnProperty(configKey)) {
            throw new Error(`Unsupported config key: ${configKey}`);
        }

        let parsedConfigValue;

        try {
            parsedConfigValue = JSON.parse(configValue);
        } catch (error) {
            parsedConfigValue = configValue;
        }

        const validValue = configValidators[configKey as CONFIG_KEYS](parsedConfigValue);
        config[configKey as CONFIG_KEYS] = validValue;
    }

    writeFileSync(configPath, iniStringify(config), 'utf8');

    outro(`${chalk.green('✔')} Config successfully set`);
};

export const configCommand = command(
    {
        name: COMMANDS.config,
        parameters: ['<mode>', '<key=values...>'],
    },
    async (argv) => {
        intro('gitwz — config');
        try {
            const { mode, keyValues } = argv._;

            if (mode === CONFIG_MODES.get) {
                const config = getConfig() || {};
                for (const key of keyValues) {
                    outro(`${key}=${config[key as keyof typeof config]}`);
                }
            } else if (mode === CONFIG_MODES.set) {
                await setConfig(keyValues.map((keyValue) => keyValue.split('=') as [string, string]));
            } else {
                throw new Error(`Unsupported mode: ${mode}. Valid modes are: "set" and "get"`);
            }
        } catch (error) {
            outro(`${chalk.red('✖')} ${error}`);
            process.exit(1);
        }
    },
);
