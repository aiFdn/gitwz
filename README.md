<div align="center">
  <div>
    <img src=".github/logo-grad.svg" alt="GitWiz logo"/>
    <h1 align="center">GitWiz</h1>
    <h4 align="center">Follow the bird <a href="https://twitter.com/io_Y_oi"><img src="https://img.shields.io/twitter/follow/io_Y_oi?style=flat&label=io_Y_oi&logo=twitter&color=0bf&logoColor=fff" align="center"></a>
  </div>
	<h2>Auto-generate meaningful commits in 1 second</h2>
	<p>Killing lame commits with AI 🤯🔫</p>
	<a href="https://www.npmjs.com/package/gitwz"><img src="https://img.shields.io/npm/v/gitwz" alt="Current version"></a>
  <h4 align="center"><a href="https://twitter.com/io_Y_oi/status/1683448136973582336">🪩 Winner of GitHub 2023 HACKATHON 🪩</a></h4>
</div>

---

<div align="center">
    <img src=".github/gitwz-example.png" alt="GitWiz example"/>
</div>

All the commits in this repo are authored by GitWiz — look at [the commits](https://github.com/SHSharkar/gitwz/commit/eae7618d575ee8d2e9fff5de56da79d40c4bc5fc) to see how GitWiz works. Emojis and long commit descriptions are configurable.

## Setup GitWiz as a CLI tool

You can use GitWiz by simply running it via the CLI like this `gwz`. 2 seconds and your staged changes are committed with a meaningful message.

1. Install GitWiz globally to use in any repository:

   ```sh
   npm install -g gitwz
   ```

   MacOS may ask to run the command with `sudo` when installing a package globally.

2. Get your API key from [OpenAI](https://platform.openai.com/account/api-keys). Make sure that you add your payment details, so the API works.

3. Set the key to GitWiz config:

   ```sh
   gwz config set GWZ_OPENAI_API_KEY=<your_api_key>
   ```

   Your API key is stored locally in the `~/.gitwz` config file.

## Usage

You can call GitWiz directly to generate a commit message for your staged changes:

```sh
git add <files...>
gitwz
```

You can also use the `gwz` shortcut:

```sh
git add <files...>
gwz
```

## Configuration

### Local per repo configuration

Create a `.env` file and add GitWiz config variables there like this:

```env
GWZ_OPENAI_API_KEY=<your OpenAI API token>
GWZ_OPENAI_MAX_TOKENS=<max response tokens from OpenAI API>
GWZ_OPENAI_BASE_PATH=<may be used to set proxy path to OpenAI api>
GWZ_DESCRIPTION=<postface a message with ~3 sentences description of the changes>
GWZ_EMOJI=<boolean, add GitMoji>
GWZ_MODEL=<either 'gpt-4', 'gpt-3.5-turbo-16k' (default), 'gpt-3.5-turbo-0613' or 'gpt-3.5-turbo'>
GWZ_LANGUAGE=<locale, scroll to the bottom to see options>
GWZ_MESSAGE_TEMPLATE_PLACEHOLDER=<message template placeholder, default: '$msg'>
GWZ_PROMPT_MODULE=<either conventional-commit or @commitlint, default: conventional-commit>
```

### Global config for all repos

Local config still has more priority than Global config, but you may set `GWZ_MODEL` and `GWZ_LOCALE` globally and set local configs for `GWZ_EMOJI` and `GWZ_DESCRIPTION` per repo which is more convenient.

Simply set any of the variables above like this:

```sh
gwz config set GWZ_MODEL=gpt-4
```

Configure [GitMoji](https://gitmoji.dev/) to preface a message.

```sh
gwz config set GWZ_EMOJI=true
```

To remove preface emojis:

```sh
gwz config set GWZ_EMOJI=false
```

### Switch to GPT-4 or other models

By default, GitWiz uses `gpt-3.5-turbo-16k` model.

You may switch to GPT-4 which performs better, but costs ~x15 times more 🤠

```sh
gwz config set GWZ_MODEL=gpt-4
```

or for as a cheaper option:

```sh
gwz config set GWZ_MODEL=gpt-3.5-turbo
```

or for GPT-4 Turbo (Preview) which is more capable, has knowledge of world events up to April 2023, a 128k context window and 2-3x cheaper vs GPT-4:

```sh
gwz config set GWZ_MODEL=gpt-4-1106-preview
```

Make sure that you spell it `gpt-4` (lowercase) and that you have API access to the 4th model. Even if you have ChatGPT+, that doesn't necessarily mean that you have API access to GPT-4.

### Locale configuration

To globally specify the language used to generate commit messages:

```sh
# de, German ,Deutsch
gwz config set GWZ_LANGUAGE=de
gwz config set GWZ_LANGUAGE=German
gwz config set GWZ_LANGUAGE=Deutsch

# fr, French, française
gwz config set GWZ_LANGUAGE=fr
gwz config set GWZ_LANGUAGE=French
gwz config set GWZ_LANGUAGE=française
```

The default language setting is **English**
All available languages are currently listed in the [i18n](https://github.com/SHSharkar/gitwz/tree/master/src/i18n) folder

### Switch to `@commitlint`

GitWiz allows you to choose the prompt module used to generate commit messages. By default, GitWiz uses its conventional-commit message generator. However, you can switch to using the `@commitlint` prompt module if you prefer. This option lets you generate commit messages in respect with the local config.

You can set this option by running the following command:

```sh
gwz config set GWZ_PROMPT_MODULE=<module>
```

Replace `<module>` with either `conventional-commit` or `@commitlint`.

#### Example:

To switch to using th` '@commitlint` prompt module, run:

```sh
gwz config set GWZ_PROMPT_MODULE=@commitlint
```

To switch back to the default conventional-commit message generator, run:

```sh
gwz config set GWZ_PROMPT_MODULE=conventional-commit
```

#### Integrating with `@commitlint`

The integration between `@commitlint` and GitWiz is done automatically the first time GitWiz is run with `GWZ_PROMPT_MODULE` set to `@commitlint`. However, if you need to force set or reset the configuration for `@commitlint`, you can run the following command:

```sh
gwz commitlint force
```

To view the generated configuration for `@commitlint`, you can use this command:

```sh
gwz commitlint get
```

This allows you to ensure that the configuration is set up as desired.

Additionally, the integration creates a file named `.gitwz-commitlint` which contains the prompts used for the local `@commitlint` configuration. You can modify this file to fine-tune the example commit message generated by OpenAI. This gives you the flexibility to make adjustments based on your preferences or project guidelines.

GitWiz generates a file named `.gitwz-commitlint` in your project directory which contains the prompts used for the local `@commitlint` configuration. You can modify this file to fine-tune the example commit message generated by OpenAI. If the local `@commitlint` configuration changes, this file will be updated the next time GitWiz is run.

This offers you greater control over the generated commit messages, allowing for customization that aligns with your project's conventions.

## Git flags

The `gitwz` or `gwz` commands can be used in place of the `git commit -m "${generatedMessage}"` command. This means that any regular flags that are used with the `git commit` command will also be applied when using `gitwz` or `gwz`.

```sh
gwz --no-verify
```

is translated to :

```sh
git commit -m "${generatedMessage}" --no-verify
```

To include a message in the generated message, you can utilize the template function, for instance:

```sh
gwz '#205: $msg’
```

> gitwz examines placeholders in the parameters, allowing you to append additional information before and after the placeholders, such as the relevant Issue or Pull Request. Similarly, you have the option to customize the GWZ_MESSAGE_TEMPLATE_PLACEHOLDER configuration item, for example, simplifying it to $m!"

### Message Template Placeholder Config

#### Overview

The `GWZ_MESSAGE_TEMPLATE_PLACEHOLDER` feature in the `gitwz` tool allows users to embed a custom message within the generated commit message using a template function. This configuration is designed to enhance the flexibility and customizability of commit messages, making it easier for users to include relevant information directly within their commits.

#### Implementation Details

In our codebase, the implementation of this feature can be found in the following segment:

```javascript
commitMessage = messageTemplate.replace(
  config?.GWZ_MESSAGE_TEMPLATE_PLACEHOLDER,
  commitMessage
);
```

This line is responsible for replacing the placeholder in the `messageTemplate` with the actual `commitMessage`.

#### Usage

For instance, using the command `gwz '$msg #205’`, users can leverage this feature. The provided code represents the backend mechanics of such commands, ensuring that the placeholder is replaced with the appropriate commit message.

#### Committing with the Message

Once users have generated their desired commit message, they can proceed to commit using the generated message. By understanding the feature's full potential and its implementation details, users can confidently use the generated messages for their commits.

### Ignore files

You can remove files from being sent to OpenAI by creating a `.gitwzignore` file. For example:

```ignorelang
path/to/large-asset.zip
**/*.jpg
```

This helps prevent gitwz from uploading artifacts and large files.

By default, gitwz ignores files matching: `*-lock.*` and `*.lock`

## Git hook (KILLER FEATURE)

You can set GitWiz as Git [`prepare-commit-msg`](https://git-scm.com/docs/githooks#_prepare_commit_msg) hook. Hook integrates with your IDE Source Control and allows you to edit the message before committing.

To set the hook:

```sh
gwz hook set
```

To unset the hook:

```sh
gwz hook unset
```

To use the hook:

```sh
git add <files...>
git commit
```

Or follow the process of your IDE Source Control feature, when it calls `git commit` command — GitWiz will integrate into the flow.

## Setup GitWiz as a GitHub Action (BETA) 🔥

GitWiz is now available as a GitHub Action which automatically improves all new commits messages when you push to remote!

This is great if you want to make sure all of the commits in all of your repository branches are meaningful and not lame like `fix1` or `done2`.

Create a file `.github/workflows/gitwz.yml` with the contents below:

```yml
name: 'GitWiz Action'

on:
  push:
    # this list of branches is often enough,
    # but you may still ignore other public branches
    branches-ignore: [main master dev development release]

jobs:
  gitwz:
    timeout-minutes: 10
    name: GitWiz
    runs-on: ubuntu-latest
    permissions: write-all
    steps:
      - name: Setup Node.js Environment
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: SHSharkar/gitwz@github-action-v1.0.4
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

        env:
          # set openAI api key in repo actions secrets,
          # for openAI keys go to: https://platform.openai.com/account/api-keys
          # for repo secret go to: <your_repo_url>/settings/secrets/actions
          GWZ_OPENAI_API_KEY: ${{ secrets.GWZ_OPENAI_API_KEY }}

          # customization
          GWZ_OPENAI_MAX_TOKENS: 500
          GWZ_OPENAI_BASE_PATH: ''
          GWZ_DESCRIPTION: false
          GWZ_EMOJI: false
          GWZ_MODEL: gpt-3.5-turbo-16k
          GWZ_LANGUAGE: en
          GWZ_PROMPT_MODULE: conventional-commit
```

That is it. Now when you push to any branch in your repo — all NEW commits are being improved by your never-tired AI.

Make sure you exclude public collaboration branches (`main`, `dev`, `etc`) in `branches-ignore`, so GitWiz does not rebase commits there while improving the messages.

Interactive rebase (`rebase -i`) changes commits' SHA, so the commit history in remote becomes different from your local branch history. This is okay if you work on the branch alone, but may be inconvenient for other collaborators.

## Payments

You pay for your requests to OpenAI API on your own.

GitWiz stores your key locally.

GitWiz by default uses 3.5-turbo-16k model, it should not exceed $0.10 per casual working day.

You may switch to gpt-4, it's better, but more expensive.
