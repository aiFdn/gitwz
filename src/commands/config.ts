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
    GW_OPENAI_API_KEY = 'GW_OPENAI_API_KEY',
    GW_OPENAI_MAX_TOKENS = 'GW_OPENAI_MAX_TOKENS',
    GW_OPENAI_BASE_PATH = 'GW_OPENAI_BASE_PATH',
    GW_DESCRIPTION = 'GW_DESCRIPTION',
    GW_EMOJI = 'GW_EMOJI',
    GW_MODEL = 'GW_MODEL',
    GW_LANGUAGE = 'GW_LANGUAGE',
    GW_MESSAGE_TEMPLATE_PLACEHOLDER = 'GW_MESSAGE_TEMPLATE_PLACEHOLDER',
    GW_PROMPT_MODULE = 'GW_PROMPT_MODULE',
    GW_USE_AZURE_OPENAI = 'GW_USE_AZURE_OPENAI',
    GW_AZURE_OPENAI_API_KEY = 'GW_AZURE_OPENAI_API_KEY',
    GW_AZURE_OPENAI_ENDPOINT = 'GW_AZURE_OPENAI_ENDPOINT',
    GW_AZURE_OPENAI_DEPLOYMENT_NAME = 'GW_AZURE_OPENAI_DEPLOYMENT_NAME',
}

export const DEFAULT_MODEL_TOKEN_LIMIT = 4096;

export enum CONFIG_MODES {
    get = 'get',
    set = 'set',
}

const validateConfig = (key: string, condition: any, validationMessage: string) => {
    if (!condition) {
        outro(
            `${chalk.hex('#ffffff').bold.bgHex('#FF0303')(
                ` ERROR `,
            )} Unsupported config key ${key}: ${validationMessage}`,
        );

        process.exit(1);
    }
};

export const configValidators = {
    [CONFIG_KEYS.GW_OPENAI_API_KEY](value: any, config: any = {}) {
        validateConfig(CONFIG_KEYS.GW_OPENAI_API_KEY, value, 'Cannot be empty');
        validateConfig(CONFIG_KEYS.GW_OPENAI_API_KEY, value.startsWith('sk-'), 'Must start with "sk-"');
        validateConfig(
            CONFIG_KEYS.GW_OPENAI_API_KEY,
            config[CONFIG_KEYS.GW_OPENAI_BASE_PATH] || value.length >= 51,
            'Must be at least 51 characters long',
        );

        return value;
    },

    [CONFIG_KEYS.GW_DESCRIPTION](value: any) {
        validateConfig(CONFIG_KEYS.GW_DESCRIPTION, typeof value === 'boolean', 'Must be true or false');

        return value;
    },

    [CONFIG_KEYS.GW_OPENAI_MAX_TOKENS](value: any) {
        // If the value is a string, convert it to a number.
        if (typeof value === 'string') {
            value = parseInt(value);
            validateConfig(CONFIG_KEYS.GW_OPENAI_MAX_TOKENS, !isNaN(value), 'Must be a number');
        }
        validateConfig(
            CONFIG_KEYS.GW_OPENAI_MAX_TOKENS,
            value ? typeof value === 'number' : undefined,
            'Must be a number',
        );

        return value;
    },

    [CONFIG_KEYS.GW_EMOJI](value: any) {
        validateConfig(CONFIG_KEYS.GW_EMOJI, typeof value === 'boolean', 'Must be true or false');

        return value;
    },

    [CONFIG_KEYS.GW_LANGUAGE](value: any) {
        validateConfig(CONFIG_KEYS.GW_LANGUAGE, getI18nLocal(value), `${value} is not supported yet`);
        return getI18nLocal(value);
    },

    [CONFIG_KEYS.GW_OPENAI_BASE_PATH](value: any) {
        validateConfig(CONFIG_KEYS.GW_OPENAI_BASE_PATH, typeof value === 'string', 'Must be string');
        return value;
    },

    [CONFIG_KEYS.GW_MODEL](value: any) {
        validateConfig(
            CONFIG_KEYS.GW_MODEL,
            [
                'gpt-4o',
                'gpt-4o-mini',
                'gpt-4-turbo',
                'gpt-4-turbo-preview',
                'gpt-4-0125-preview',
                'gpt-4-1106-preview',
                'gpt-4',
                'gpt-3.5-turbo-0125',
                'gpt-3.5-turbo',
                'gpt-3.5-turbo-1106',
            ].includes(value),
            `${value} is not supported yet, use 'gpt-4o','gpt-4o-mini','gpt-4-turbo','gpt-4-turbo-preview','gpt-4-0125-preview','gpt-4-1106-preview','gpt-4','gpt-3.5-turbo-0125','gpt-3.5-turbo','gpt-3.5-turbo-1106'`,
        );
        return value;
    },
    [CONFIG_KEYS.GW_MESSAGE_TEMPLATE_PLACEHOLDER](value: any) {
        validateConfig(
            CONFIG_KEYS.GW_MESSAGE_TEMPLATE_PLACEHOLDER,
            value.startsWith('$'),
            `${value} must start with $, for example: '$msg'`,
        );
        return value;
    },

    [CONFIG_KEYS.GW_PROMPT_MODULE](value: any) {
        validateConfig(
            CONFIG_KEYS.GW_PROMPT_MODULE,
            ['conventional-commit', '@commitlint'].includes(value),
            `${value} is not supported yet, use '@commitlint' or 'conventional-commit' (default)`,
        );
        return value;
    },

    [CONFIG_KEYS.GW_USE_AZURE_OPENAI](value: any) {
        if (typeof value === 'string') {
            validateConfig(
                CONFIG_KEYS.GW_USE_AZURE_OPENAI,
                ['true', 'false'].includes(value.toLowerCase()),
                'Must be "true" or "false"',
            );
            return value.toLowerCase() === 'true';
        } else if (typeof value === 'boolean') {
            return value;
        } else {
            throw new Error('Must be a boolean or a string "true" or "false"');
        }
    },

    [CONFIG_KEYS.GW_AZURE_OPENAI_API_KEY](value: any) {
        validateConfig(CONFIG_KEYS.GW_AZURE_OPENAI_API_KEY, value, 'Cannot be empty');
        return value;
    },

    [CONFIG_KEYS.GW_AZURE_OPENAI_ENDPOINT](value: any) {
        validateConfig(CONFIG_KEYS.GW_AZURE_OPENAI_ENDPOINT, value.startsWith('https://'), 'Must be a valid HTTPS URL');
        return value;
    },

    [CONFIG_KEYS.GW_AZURE_OPENAI_DEPLOYMENT_NAME](value: any) {
        validateConfig(CONFIG_KEYS.GW_AZURE_OPENAI_DEPLOYMENT_NAME, value, 'Cannot be empty');
        return value;
    },
};

export type ConfigType = {
    [key in CONFIG_KEYS]?: any;
};

const configPath = pathJoin(homedir(), '.gitwz');

// eslint-disable-next-line complexity
export const getConfig = (): ConfigType | null => {
    const configFromEnv = {
        GW_OPENAI_API_KEY: process.env.GW_OPENAI_API_KEY,
        GW_OPENAI_MAX_TOKENS: process.env.GW_OPENAI_MAX_TOKENS ? Number(process.env.GW_OPENAI_MAX_TOKENS) : undefined,
        GW_OPENAI_BASE_PATH: process.env.GW_OPENAI_BASE_PATH,
        GW_DESCRIPTION: process.env.GW_DESCRIPTION === 'true' ? true : false,
        GW_EMOJI: process.env.GW_EMOJI === 'true' ? true : false,
        GW_MODEL: process.env.GW_MODEL || 'gpt-4o-mini',
        GW_LANGUAGE: process.env.GW_LANGUAGE || 'en',
        GW_MESSAGE_TEMPLATE_PLACEHOLDER: process.env.GW_MESSAGE_TEMPLATE_PLACEHOLDER || '$msg',
        GW_PROMPT_MODULE: process.env.GW_PROMPT_MODULE || 'conventional-commit',
        GW_USE_AZURE_OPENAI: process.env.GW_USE_AZURE_OPENAI || 'false',
        GW_AZURE_OPENAI_API_KEY: process.env.GW_AZURE_OPENAI_API_KEY,
        GW_AZURE_OPENAI_ENDPOINT: process.env.GW_AZURE_OPENAI_ENDPOINT,
        GW_AZURE_OPENAI_DEPLOYMENT_NAME: process.env.GW_AZURE_OPENAI_DEPLOYMENT_NAME,
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

        const validConfigKey = configKey.startsWith('GW_') ? configKey : `GW_${configKey}`;

        if (validConfigKey in configValidators) {
            try {
                const validator = configValidators[validConfigKey as CONFIG_KEYS];
                config[validConfigKey] = validator(
                    config[configKey] ?? configFromEnv[validConfigKey as keyof typeof configFromEnv],
                    config,
                );

                if (validConfigKey !== configKey) {
                    delete config[configKey];
                }
            } catch (error) {
                outro(`'${configKey}' is invalid or doesn't exist. Valid keys start with 'GW_'.`);
                outro(`Please manually fix the global '~/.gitwz' config file.`);
                process.exit(1);
            }
        } else {
            outro(`'${configKey}' is not a recognized configuration key.`);
            outro(`Please manually fix the global '~/.gitwz' config file.`);
            process.exit(1);
        }
    }

    return config as ConfigType;
};

export const setConfig = (keyValues: [key: string, value: string][]) => {
    const config = getConfig() || {};

    for (const [configKey, configValue] of keyValues) {
        // eslint-disable-next-line no-prototype-builtins
        if (!configValidators.hasOwnProperty(configKey)) {
            throw new Error(`Unsupported config key: ${configKey}`);
        }

        if (config[configKey] !== undefined && config[configKey] !== null && config[configKey] !== '') {
            outro(`${chalk.yellow('Warning:')} Skipping ${configKey} as it already has a value.`);
            continue;
        }

        let parsedConfigValue;

        try {
            parsedConfigValue = JSON.parse(configValue);
        } catch (error) {
            parsedConfigValue = configValue;
        }

        config[configKey as CONFIG_KEYS] = configValidators[configKey as CONFIG_KEYS](parsedConfigValue);
    }

    writeFileSync(configPath, iniStringify(config), 'utf8');

    outro(`${chalk.hex('#ffffff').bold.bgHex('#3EC70B')(` SUCCESS `)} Config successfully set`);
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
            outro(`${chalk.hex('#ffffff').bold.bgHex('#FF0303')(` ERROR `)} ${error}`);
            process.exit(1);
        }
    },
);
