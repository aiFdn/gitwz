# **GitWiz: Supercharge Your Git Commits**

## **🔧 Setup GitWiz as a CLI Tool**

Transform your Git experience with GitWiz. It's a breeze to run via the CLI (`gwz`), committing your changes with insightful messages in seconds.

### **Installation Guide**

1. **Global Installation**:  
   Bring GitWiz to any repository on your system:

    ```sh
    npm install -g gitwz
    ```

    > **MacOS Tip**: You might need `sudo` for a global install.

2. **API Key Acquisition**:  
   Grab your API key from [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys). Don't forget to include your payment details for full API functionality.

3. **Configuring Your API Key**:  
   Seamlessly integrate your API key into GitWiz:

    ```sh
    gwz config set GWZ_OPENAI_API_KEY=<your_api_key>
    ```

    Rest assured, your key is securely stored in `~/.gitwz`.

## **🚀 Usage**

Invoke GitWiz to craft commit messages for staged changes:

```sh
git add <files...>
gitwz
```

Or, opt for the `gwz` shortcut:

```sh
git add <files...>
gwz
```

## **⚙️ Configuration**

### Local per Repo Setup

Personalize GitWiz for each project by creating a `.env` file with these settings:

```env
GWZ_OPENAI_API_KEY=<your OpenAI API token>
GWZ_OPENAI_MAX_TOKENS=<max response tokens from OpenAI API>
GWZ_OPENAI_BASE_PATH=<may be used to set proxy path to OpenAI API>
GWZ_DESCRIPTION=<postface a message with ~3 sentences description of the changes>
GWZ_EMOJI=<boolean, add GitMoji>
GWZ_MODEL=<either 'gpt-4-1106-preview','gpt-4','gpt-4-0613','gpt-4-0314','gpt-3.5-turbo-1106','gpt-3.5-turbo','gpt-3.5-turbo-0613','gpt-3.5-turbo-0301'>
GWZ_LANGUAGE=<locale, scroll to the bottom to see options>
GWZ_MESSAGE_TEMPLATE_PLACEHOLDER=<message template placeholder, default: '$msg'>
GWZ_PROMPT_MODULE=<either conventional-commit or @commitlint, default: conventional-commit>
```

## **⚙️ Global Configuration**

Effortlessly apply settings across all repositories with GitWiz's global configuration options:

-   **API Key**:

    ```sh
    gwz config set GWZ_OPENAI_API_KEY=<your OpenAI API token>
    ```

    Securely store your OpenAI API token for global access.

-   **Max Response Tokens**:

    ```sh
    gwz config set GWZ_OPENAI_MAX_TOKENS=<max response tokens from OpenAI API>
    ```

    Control the maximum response tokens from the OpenAI API.

-   **OpenAI API Base Path**:

    ```sh
    gwz config set GWZ_OPENAI_BASE_PATH=<proxy path to OpenAI API>
    ```

    Optionally set a proxy path to the OpenAI API.

-   **Description Postface**:

    ```sh
    gwz config set GWZ_DESCRIPTION=<postface a message with ~3 sentences>
    ```

    Append a brief description, up to 3 sentences, to your commit messages.

-   **GitMoji Integration**:

    ```sh
    gwz config set GWZ_EMOJI=true
    ```

    Enhance commit messages with GitMoji. Learn more about GitMoji [here](https://gitmoji.dev/).

    To disable GitMoji:

    ```sh
    gwz config set GWZ_EMOJI=false
    ```

-   **Model Selection**:

    ```sh
    gwz config set GWZ_MODEL=<model_name>
    ```

    Choose from a variety of GPT models for different performance and cost options.

-   **Language Selection**:

    ```sh
    gwz config set GWZ_LANGUAGE=<locale>
    ```

    Set your preferred language for commit messages. Check the [i18n folder](https://github.com/SHSharkar/gitwz/tree/main/src/i18n) for available languages.

-   **Message Template Placeholder**:

    ```sh
    gwz config set GWZ_MESSAGE_TEMPLATE_PLACEHOLDER=<placeholder_format>
    ```

    Customize the format of your commit message placeholders.

-   **Prompt Module**:
    ```sh
    gwz config set GWZ_PROMPT_MODULE=<module_choice>
    ```
    Choose between `conventional-commit` or `@commitlint` for generating commit messages.

### Switching Models: Flexibility at Your Fingertips

-   **Default Model**: GitWiz starts with `gpt-3.5-turbo-1106`.
-   **Upgrade to GPT-4**: For superior performance (note the higher cost):

    ```sh
    gwz config set GWZ_MODEL=gpt-4
    ```

-   **GPT-4 Turbo (Preview)**: A savvy blend of capability and economy:

    ```sh
    gwz config set GWZ_MODEL=gpt-4-1106-preview
    ```

## **🌍 Language Configuration**

Tailor GitWiz to communicate in your preferred language. Set the language for commit messages globally:

```sh
# Example for setting German
gwz config set GWZ_LANGUAGE=de
# Or using the full language name
gwz config set GWZ_LANGUAGE=German

# Example for setting French
gwz config set GWZ_LANGUAGE=fr
# Or using the full language name
gwz config set GWZ_LANGUAGE=French
```

The default language is set to **English**.

Explore the full list of supported languages and their respective codes in the [i18n folder](https://github.com/SHSharkar/gitwz/tree/main/src/i18n) of the GitWiz repository.

## **🔍 Opt for `@commitlint`**

GitWiz offers the flexibility to choose your preferred style for generating commit messages. By default, it uses the `conventional-commit` format, but you can easily switch to `@commitlint` for a more structured and standardized approach.

### Switching to `@commitlint`:

1. **Set the Prompt Module**:  
   Change the prompt module to `@commitlint` using the following command:

    ```sh
    gwz config set GWZ_PROMPT_MODULE=@commitlint
    ```

    This command directs GitWiz to use `@commitlint` conventions when generating commit messages.

2. **Reverting to Default**:  
   If you wish to return to the default `conventional-commit` style, simply run:

    ```sh
    gwz config set GWZ_PROMPT_MODULE=conventional-commit
    ```

### Integrating `@commitlint` with GitWiz:

-   **Automatic Integration**:  
    The first time you run GitWiz with `GWZ_PROMPT_MODULE` set to `@commitlint`, the tool will automatically configure the integration.

-   **Manual Configuration**:  
    If you need to force reset or set the `@commitlint` configuration, use the command:

    ```sh
    gwz commitlint force
    ```

-   **Viewing Current Configuration**:  
    To check your current `@commitlint` configuration, utilize:

    ```sh
    gwz commitlint get
    ```

-   **Customization with `.gitwz-commitlint`**:  
    GitWiz creates a `.gitwz-commitlint` file in your project directory. This file contains the prompts used for the local `@commitlint` configuration, and you can edit it to fine-tune the generated commit messages according to your project's guidelines.

### Why Choose `@commitlint`?

`@commitlint` is ideal for projects that require a high level of commit message discipline and consistency. It enforces a set of rules for commit message formatting, making your commit history more readable and organized. Opting for `@commitlint` with GitWiz combines the power of AI-generated messages with the structured approach of `@commitlint`, giving you the best of both worlds.

## **🚩 Git Flags: Enhanced Flexibility and Compatibility**

The `gitwz` or `gwz` commands are designed to seamlessly integrate with your existing Git workflow, offering compatibility with standard Git flags. This integration ensures that GitWiz adapts to your version control practices, enhancing them with AI-powered commit messages without altering the familiar Git command structure.

### Seamless Integration with Git Commit Flags

-   **Command Equivalence**:  
    When you use `gitwz` or `gwz`, it acts as a direct substitute for the `git commit -m` command, incorporating the generated message automatically.

    **Example**:  
    The command:

    ```sh
    gwz --no-verify
    ```

    is equivalent to:

    ```sh
    git commit -m "${generatedMessage}" --no-verify
    ```

    In this scenario, `--no-verify` or any other Git flag you use will be applied just as it is with a standard Git commit.

### Advanced Message Customization

-   **Template Functionality**:  
    GitWiz provides a template feature, allowing you to enrich the AI-generated commit message with custom text. This is especially useful for adding contextual information such as issue numbers, tags, or descriptive prefixes.

    **Usage**:  
    To prepend a custom string to your generated message, use the command:

    ```sh
    gwz 'Issue #205: $msg'
    ```

    Here, `Issue #205: ` is your custom addition, and `$msg` serves as a placeholder for the generated message.

-   **Placeholder Configuration**:  
    GitWiz analyzes placeholders within command parameters, offering flexibility in how your custom text is incorporated. You can define your preferred placeholder format in the GitWiz configuration, which will be recognized and replaced in the commit message.

    **Example**:  
    If you set your `GWZ_MESSAGE_TEMPLATE_PLACEHOLDER` to a simpler form like `$m`, GitWiz will use this new placeholder in processing your commit messages.

### Enhancing Your Version Control Practices

By utilizing these features, GitWiz not only maintains the core functionalities of Git but also introduces a layer of AI-enhanced efficiency and customization to your commit process. It's designed to fit smoothly into your existing Git routine, ensuring a familiar yet improved experience.

### **Message Template Placeholder Implementation**

The `Message Template Placeholder` feature in GitWiz allows you to seamlessly blend custom text with AI-generated commit messages. This functionality is particularly useful when you want to include specific tags, references, or any standardized text formats in your commits.

#### How It Works:

The underlying mechanism of this feature involves replacing a placeholder in your message template with the generated commit message. This process is handled by the following code snippet:

```javascript
commitMessage = messageTemplate.replace(config?.GWZ_MESSAGE_TEMPLATE_PLACEHOLDER, commitMessage);
```

In this implementation:

-   `messageTemplate` refers to the template you've set, containing the placeholder.
-   `GWZ_MESSAGE_TEMPLATE_PLACEHOLDER` is the configurable placeholder within your template. By default, it could be something like `$msg`.
-   The `replace` function swaps the placeholder with the actual commit message generated by GitWiz.

#### Practical Example:

If you've set your `GWZ_MESSAGE_TEMPLATE_PLACEHOLDER` to `$msg` and your `messageTemplate` is something like `"Fixes issue #123: $msg"`, GitWiz will replace `$msg` with the AI-generated message. So, if GitWiz generates "Updated the README for clarity", your final commit message becomes "Fixes issue #123: Updated the README for clarity".

This feature adds a layer of customization to your automated commit messages, ensuring they align with your project's or team's specific conventions or requirements.

## **🚫 Ignore Unwanted Files**

GitWiz offers a smart way to exclude specific files or directories from being processed. This is particularly useful for preventing large, irrelevant, or sensitive files from being included in the AI analysis.

### How to Set Up `.gitwzignore`:

1. **Create a `.gitwzignore` File**:  
   Just like `.gitignore`, create a `.gitwzignore` file in your project's root directory.

2. **Specify Files or Patterns**:  
   Inside this file, list the files or patterns you want GitWiz to ignore. For example:

    ```ignorelang
    # Ignore a specific file
    path/to/large-asset.zip

    # Ignore all JPG files in any directory
    **/*.jpg
    ```

3. **GitWiz Respects Your Privacy**:  
   GitWiz will automatically exclude these files from processing, ensuring that only relevant and permitted content is analyzed for commit message generation.

### Default Ignored Patterns:

By default, GitWiz is configured to ignore certain types of files to optimize performance and security. These include:

-   Lockfiles typically generated by package managers (like `*-lock.*` and `*.lock`).

### Customizing for Your Needs:

You have the flexibility to tailor the `.gitwzignore` file to suit your project's specific requirements. This ensures that GitWiz focuses only on the files that contribute meaningfully to your commit messages, while maintaining the integrity and efficiency of your repository.

## **🔗 Git Hook: The Game-Changer**

Set up GitWiz as a `prepare-commit-msg` hook for seamless integration:

```sh
gwz hook set
```

Unset with ease:

```sh
gwz hook unset
```

Use it traditionally with `git commit`, or let your IDE's Source Control feature take the lead.

## **🌟 GitWiz as a GitHub Action (BETA)**

Automate commit message enhancement with GitWiz, now available as a GitHub Action. This powerful feature automatically improves commit messages across all branches when you push to your remote repository.

### Setting Up GitWiz GitHub Action

1. **Create the Workflow File**:  
   Create a `.github/workflows/gitwz.yml` file in your repository to define the GitWiz action.

2. **Configure the Workflow**:  
   Use the following YAML configuration, with detailed comments for guidance:

    ```yml
    name: 'GitWiz Action'

    on:
        push:
            branches-ignore: [main, master, dev, development, release]

    jobs:
        gitwz:
            timeout-minutes: 10
            name: GitWiz
            runs-on: ubuntu-latest
            permissions: write-all
            steps:
                - name: Setup Node.js Environment
                  uses: actions/setup-node@v4
                  with:
                      node-version: '18'
                - uses: actions/checkout@v4
                  with:
                      fetch-depth: 0
                - uses: SHSharkar/gitwz@v4.0.10
                  with:
                      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

                  # Set up your OpenAI API key in the repository's action secrets
                  # For obtaining OpenAI keys, visit: https://platform.openai.com/account/api-keys
                  # To add to your repository's secrets, navigate to: <your_repo_url>/settings/secrets/actions
                  env:
                      GWZ_OPENAI_API_KEY: ${{ secrets.GWZ_OPENAI_API_KEY }}
                      GWZ_OPENAI_MAX_TOKENS: 500
                      GWZ_OPENAI_BASE_PATH: ''
                      GWZ_DESCRIPTION: false
                      GWZ_EMOJI: false
                      GWZ_MODEL: gpt-3.5-turbo-1106
                      GWZ_LANGUAGE: en
                      GWZ_PROMPT_MODULE: conventional-commit
    ```

3. **Customization**:  
   Adjust the YAML configuration to fit your project's needs. You can set branch exclusions in `branches-ignore` to avoid GitWiz rebasing commits in collaborative branches.

### Important Notes for Using GitWiz GitHub Action

-   **Automatic Enhancement**: GitWiz automatically improves all new commit messages when pushing to any branch not listed in `branches-ignore`.
-   **Branch Management**: Take care with branch exclusions, particularly in collaborative settings, to maintain commit history integrity.
-   **Workflow Adaptation**: Tailor the action to your workflow, including the GitWiz model, language preference, and other parameters.

## **💳 Payments: Transparent and Controlled**

-   GitWiz operates on your OpenAI API token, billed directly to you.
-   Default model: `gpt-3.5-turbo-1106`. Manage costs while enjoying enhanced capabilities.
-   Opt for `gpt-4-1106-preview` for a premium experience.

## **Credits and Acknowledgements**

GitWiz is a reimagined version, forked from the innovative work of [di-sukharev](https://github.com/di-sukharev) on the [OpenCommit](https://github.com/di-sukharev/opencommit) project. This tool builds upon the foundational concepts of OpenCommit, enhancing and tailoring functionalities to deliver an elevated user experience.

A special thanks to [di-sukharev](https://github.com/di-sukharev) and contributors to the OpenCommit project for their original ideas and contributions, which have been instrumental in the development of GitWiz.
