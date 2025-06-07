# 🤖 gitprompt - AI-Powered Git Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logo=bun&logoColor=white)](https://bun.sh)

An intelligent CLI tool that automatically stages and commits files using AI-powered commit message generation.

> ⚠️ **Note**: This tool requires an OpenAI API key to function. It will analyze your code changes and generate commit messages using GPT-4.

> ⚠️ **Vibe Coded**: The majority of this code was "vibe coded". I use the tool for my own projects, and I checked for any serious bugs and issues, but still: Use at your own risk.

## ✨ Features

- 🤖 **AI-powered commit messages** using GPT-4.1 with conventional commit format
- 📊 **Line-by-line diff analysis** showing exactly what changed
- 🎯 **Smart file grouping** for logical commits
- 🔍 **Detailed change tracking** (added/removed/modified lines)
- ✅ **Safety checks** to prevent conflicts with existing staged files
- 🎨 **Beautiful colored CLI** with interactive confirmations
- ⚡ **YOLO mode** for automatic commits without confirmation
- 📋 **Custom rules support** via `.gitprompt` file or `--rules` flag

## 🚀 Installation

### Prerequisites

- **Node.js** (v18+) or **Bun** (v1.0+)
- **Git** configured with user.name and user.email
- **OpenAI API key** ([Get one here](https://platform.openai.com/api-keys))

### Run directly without installing (Recommended)

Make sure you have a global OPENAI_API_KEY environment variable configured, or you supply it directly to the command.
You can run `gitprompt` directly without installing it globally:

```bash
# Run with npx (npm)
npx gitprompt

# Or with bunx (bun)
bunx gitprompt

# With OPENAI_API_KEY
OPENAI_API_KEY=your_api_key_here npx gitprompt
# Or with bunx (bun)
OPENAI_API_KEY=your_api_key_here bunx gitprompt

# With options
npx gitprompt --yolo
bunx gitprompt --help
```

This approach downloads and runs the latest version on-demand, which is perfect for occasional use or trying out the tool.

### Install from npm

```bash
# Install globally via npm
npm install -g gitprompt

# Or via yarn
yarn global add gitprompt

# Or via pnpm
pnpm add -g gitprompt

# Or via bun
bun install -g gitprompt
```

After installation, you can use `gitprompt` command in any git repository:

```bash
gitprompt --help
```

### Install from GitHub (Development)

```bash
# Clone the repository
git clone https://github.com/xyassini/gitprompt.git
cd gitprompt

# Install dependencies
bun install

# Make globally available (optional)
bun link
```

### Environment Setup

Create a `.env` file or set your OpenAI API key:

```bash
# Option 1: Environment variable
export OPENAI_API_KEY="your-api-key-here"

# Option 2: .env file (add to .gitignore!)
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

## 📖 Usage

### Interactive Mode (Default)
```bash
# Navigate to your git repository and run
gitprompt
```

### YOLO Mode
```bash
# Skip confirmations and commit everything automatically
gitprompt --yolo
# or short form
gitprompt -y
```

### Dry Run Mode
```bash
# Preview what would be committed without actually staging or committing files
gitprompt --dry-run
# or short form
gitprompt -d

# Combine with other flags
gitprompt --dry-run --verbose  # Show detailed output without committing
gitprompt --dry-run --yolo     # Preview all commits automatically
```

### Verbose Mode
```bash
# Show detailed logging including the AI system prompt and response
gitprompt --verbose
# or short form
gitprompt -v

# Great for debugging or understanding how the AI analyzes your changes
gitprompt --verbose --dry-run  # See the full AI interaction without committing
```

### Custom Rules File
```bash
# Use a custom rules file instead of .gitprompt
gitprompt --rules /path/to/your/rules.txt
# or short form
gitprompt -r ./my-commit-rules.txt

# Example: Use team-specific rules
gitprompt --rules ./team-standards.md --verbose
```

### Combining Flags
```bash
# All flags can be combined for powerful workflows
gitprompt --dry-run --verbose --yolo     # Preview all AI decisions automatically
gitprompt --rules ./custom.txt --verbose # Use custom rules with detailed output
gitprompt --yolo --verbose              # Auto-commit with AI interaction details
```

### Help
```bash
# View all available options and commands
gitprompt --help
```

## 🎯 CLI Options Reference

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--yolo` | `-y` | Skip confirmations and commit everything automatically | `false` |
| `--dry-run` | `-d` | Show what would be done without actually staging or committing files | `false` |
| `--rules` | `-r` | Path to custom rules file (instead of .gitprompt) | None |
| `--verbose` | `-v` | Show detailed logging and system prompt | `false` |
| `--max-tokens` | `-t` | Maximum number of tokens to use for AI processing | `10000` |
| `--help` | | Show help information | |
| `--version` | | Show version number | |

### CLI Output Example
```
🤖 gitprompt - AI-Powered Git Assistant

Options:
  -y, --yolo     Skip confirmations and commit everything automatically
                                                      [boolean] [default: false]
  -d, --dry-run  Show what would be done without actually staging or committing
                 files                                [boolean] [default: false]
  -r, --rules    Path to custom rules file (instead of .gitprompt)      [string]
  -v, --verbose  Show detailed logging and system prompt
                                                      [boolean] [default: false]
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
```

## 🎛️ Configuration

### `.gitprompt` File

You can customize the AI's behavior by creating a `.gitprompt` file in your repository root. This file allows you to:

- Define custom commit message formats
- Set project-specific rules and conventions
- Override default commit type classifications
- Add context about your project structure

#### Example `.gitprompt` File

```text
# Project-specific commit rules for gitprompt

## Commit Convention
Use conventional commits with these scopes:
- core: Core application logic
- api: API endpoints and routes  
- ui: User interface components
- docs: Documentation changes
- test: Test files and testing utilities
- config: Configuration and build files

## Custom Rules
1. For database migration files, always use "feat(db): add migration for X"
2. For API routes in /routes directory, use "feat(api): add/update X endpoint"
3. For React components, use "feat(ui): add/update X component"
4. For utility functions, prefer "refactor(core): add/update X utility"

## Project Context
This is a Node.js/React application with:
- Express.js backend API
- React frontend with TypeScript
- PostgreSQL database with Prisma ORM
- Jest for testing

When analyzing changes, consider this tech stack for better categorization.

## Special Instructions
- Group related frontend and backend changes together when they implement the same feature
- Separate database migrations into their own commits
- Keep test file changes with their corresponding implementation changes
```

#### `.gitprompt` File Rules

1. **Location**: Must be in the git repository root (same directory as `.git`)
2. **Format**: Plain text file, any format you prefer (Markdown recommended)
3. **Content**: Any instructions, rules, or context you want the AI to consider
4. **Precedence**: Takes priority over default AI instructions
5. **Fallback**: If no `.gitprompt` file exists, default behavior is used

#### Using Custom Rules Files

Instead of `.gitprompt`, you can specify any custom rules file:

```bash
# Use a different rules file
gitprompt --rules ./commit-standards.md

# Use team-wide rules from a shared location
gitprompt --rules ~/shared/team-commit-rules.txt

# Use rules with other flags
gitprompt --rules ./rules.txt --dry-run --verbose
```

### Environment Setup

Create a `.env` file or set your OpenAI API key:

```bash
# Option 1: Environment variable
export OPENAI_API_KEY="your-api-key-here"

# Option 2: .env file (add to .gitignore!)
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

## 🎬 Demo

### Standard Interactive Mode
```
🤖 gitprompt - AI-Powered Git Assistant

🤖 Analyzing repository status...
🤖 Calculating diffs...
✅ Found 3 file(s) with changes
🤖 Generating intelligent commit groups...
ℹ️  Found 2 commit group(s)

📦 Commit Group 1
Message: feat(auth): add user authentication and JWT validation
Files:
  • src/auth.ts
  • src/middleware/auth.ts
  • tests/auth.test.ts

? Commit this group? (y/n) y
🤖 Staging files: src/auth.ts, src/middleware/auth.ts, tests/auth.test.ts
🤖 Creating commit: feat(auth): add user authentication and JWT validation
✅ Committed: feat(auth): add user authentication and JWT validation

📦 Commit Group 2
Message: docs: update API documentation for auth endpoints
Files:
  • README.md
  • docs/api.md

? Commit this group? (y/n) y
✅ All done! 🎉
```

### Dry Run Mode with Verbose Output
```
🤖 gitprompt - AI-Powered Git Assistant

🧪 DRY RUN MODE: No files will be staged or committed
🔍 VERBOSE MODE: Detailed logging enabled

🤖 Analyzing repository status...
Found 4 files in status matrix
Git config: John Doe <john@example.com>
Found 3 unstaged changes:
  src/api.ts (head:1, workdir:2, stage:1)
  tests/api.test.ts (head:0, workdir:2, stage:0)
  README.md (head:1, workdir:2, stage:1)

🤖 Calculating diffs...
Diff summary:
  src/api.ts: modified (12 diff lines)
  tests/api.test.ts: added (24 diff lines)
  README.md: modified (3 diff lines)

🤖 Generating intelligent commit groups...

================================================================================
📋 SYSTEM PROMPT:
================================================================================
You are a git assistant that analyzes code changes and generates intelligent commit messages.
[... full system prompt displayed ...]

📤 SENDING TO AI MODEL: gpt-4.1-mini

📜 Using custom rules from: .gitprompt
Rules content:
Use conventional commits with these scopes:
- api: API endpoints and routes
- test: Test files and testing utilities
- docs: Documentation changes

🤖 Parsing AI recommendations...
📥 AI RESPONSE:
[
  {
    "files": ["src/api.ts", "tests/api.test.ts"],
    "commitMessage": "feat(api): add user profile endpoint with tests"
  },
  {
    "files": ["README.md"],
    "commitMessage": "docs: update API documentation"
  }
]

ℹ️  Found 2 commit group(s)
ℹ️  DRY RUN mode - no files will be staged or committed

📦 Commit Group 1
Message: feat(api): add user profile endpoint with tests
Files:
  • src/api.ts
  • tests/api.test.ts

ℹ️  [DRY RUN] Would stage files: src/api.ts, tests/api.test.ts
ℹ️  [DRY RUN] Would create commit: feat(api): add user profile endpoint with tests
✅ [DRY RUN] Would commit: feat(api): add user profile endpoint with tests

📦 Commit Group 2
Message: docs: update API documentation
Files:
  • README.md

ℹ️  [DRY RUN] Would stage files: README.md
ℹ️  [DRY RUN] Would create commit: docs: update API documentation
✅ [DRY RUN] Would commit: docs: update API documentation

✅ Dry run completed! 🎉
```

### Custom Rules Example
```
🤖 gitprompt - AI-Powered Git Assistant

📜 Using custom rules from: ./team-standards.md
Rules content:
Always prefix database changes with "db:" scope
Group UI and API changes together for features

🤖 Analyzing repository status...
[... analysis continues with custom rules applied ...]
```

## CLI Output

The CLI provides beautiful colored output with:
- 🤖 **Progress indicators** for each step
- ✅ **Success messages** when operations complete
- ❌ **Error messages** with helpful context
- 📦 **Commit group previews** showing files and messages
- ❓ **Interactive prompts** for confirmation

### Example Session
```
🤖 gitprompt - AI-Powered Git Assistant

🤖 Analyzing repository status...
🤖 Calculating diffs...
✅ Found 8 file(s) with changes
🤖 Generating intelligent commit groups...
🤖 Parsing AI recommendations...
ℹ️  Found 3 commit group(s)

📦 Commit Group 1
Message: feat(core): add AI-powered git assistant modules
Files:
  • src/ai.ts
  • src/diff.ts
  • src/git.ts

? Commit this group? (y/n) y
🤖 Staging files: src/ai.ts, src/diff.ts, src/git.ts
🤖 Creating commit: feat(core): add AI-powered git assistant modules
✅ Committed: feat(core): add AI-powered git assistant modules
```

## Project Structure

```
gitprompt/
├── src/
│   ├── git.ts      # Git operations (status, staging, committing)
│   ├── diff.ts     # Diff calculation and file content analysis
│   ├── ai.ts       # AI integration for commit message generation
│   └── utils.ts    # Validation and utility functions
├── cli.ts          # CLI interface and user interaction
├── index.ts        # Original programmatic interface
├── types.ts        # Type definitions
└── package.json
```

## Module Documentation

### `cli.ts` - CLI Interface
The main CLI application featuring:
- **Argument parsing** with yargs
- **Colored output** with yoctocolors
- **Interactive prompts** for commit confirmation
- **YOLO mode** for automated commits
- **Error handling** with user-friendly messages

### `src/git.ts`
Handles all git-related operations:
- **`getStatusMatrix()`** - Gets current git status
- **`getUnstagedChanges()`** - Filters for unstaged files
- **`getGitConfig()`** - Reads global git configuration
- **`stageFiles()`** - Stages specific files
- **`commitChanges()`** - Creates commits with author info

### `src/diff.ts`
Manages diff calculation and file analysis:
- **`calculateLineDiffs()`** - Line-by-line comparison
- **`calculateDiffForFile()`** - Complete diff analysis for a file
- **`getDiffs()`** - Processes all unstaged files
- Determines change types: `added`, `removed`, `modified`, `untracked`

### `src/ai.ts`
AI integration for intelligent commit grouping:
- **`generateCommitGroups()`** - Calls GPT-4 to analyze changes
- **`parseCommitGroups()`** - Parses AI response into structured data
- Groups related files and generates conventional commit messages

### `src/utils.ts`
Validation and utility functions:
- **`validateNoStagedFiles()`** - Ensures clean staging area
- **`validateNoDiffs()`** - Checks for changes to process

## How It Works

1. **🔍 Status Check**: Reads git status and validates no files are already staged
2. **📊 Diff Analysis**: Calculates line-by-line diffs for all unstaged files
3. **🎛️ Configuration Loading**: Reads `.gitprompt` file or custom rules file (if specified)
4. **🤖 AI Processing**: Sends diffs and custom rules to GPT-4 for intelligent file grouping and commit message generation
5. **📋 Interactive Review**: Shows each commit group and asks for confirmation (unless in YOLO mode)
6. **🧪 Dry Run Preview**: If in dry-run mode, shows what would be committed without making changes
7. **📝 Staging & Committing**: Stages and commits approved groups sequentially (skipped in dry-run mode)

### Development Usage
If you're developing locally from the GitHub repository:
```bash
# Interactive mode
bun src/index.ts

# With new flags
bun src/index.ts --dry-run --verbose
bun src/index.ts --rules ./custom-rules.txt
bun src/index.ts --yolo --dry-run

# Help
bun src/index.ts --help
```

## Configuration

- **AI Model**: Uses GPT-4.1, configurable in `src/ai.ts`
- **Git Config**: Automatically uses your global git user.name and user.email
- **Colors**: Fully customizable in the CLI code

## Safety Features

- ✅ Prevents running when files are already staged
- ✅ Validates git configuration before proceeding
- ✅ Interactive confirmations by default (unless --yolo)
- ✅ Sequential processing to avoid git conflicts
- ✅ Detailed error handling and user feedback

## Requirements

- Node.js/Bun
- Git configured with user.name and user.email
- OpenAI API key for GPT-4 access

## Dependencies

- `yargs` - Command line argument parsing
- `yoctocolors` - Terminal colors and styling
- `@ai-sdk/openai` - AI integration
- `isomorphic-git` - Git operations in JavaScript

This project was created using `bun init` in bun v1.2.12. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## 🔧 Troubleshooting

### Common Issues

**"Git user.name and user.email must be configured"**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**"There are already staged files"**
```bash
# Either commit existing staged files
git commit -m "your message"
# Or unstage them
git reset
```

**"OpenAI API Error"**
- Verify your API key is set correctly
- Check your OpenAI account has credits
- Ensure you have access to GPT-4

**"Could not find HEAD"**
- Make sure you're in a git repository
- Ensure you have at least one commit in your repository

### New Features Troubleshooting

**".gitprompt file not being used"**
- Ensure the file is in the repository root (same level as `.git` folder)
- Check file permissions are readable
- Use `--verbose` flag to see if rules are being loaded:
  ```bash
  gitprompt --verbose
  # Look for "Using custom rules from: .gitprompt" message
  ```

**"Custom rules file not found"**
```bash
# Verify the file path exists
ls -la /path/to/your/rules.txt

# Use absolute path if relative path isn't working
gitprompt --rules /absolute/path/to/rules.txt

# Check current directory
pwd
gitprompt --rules ./rules.txt
```

**"Dry run mode not showing expected output"**
- Ensure you have unstaged changes: `git status`
- Combine with verbose for more details: `gitprompt --dry-run --verbose`
- Check that files are actually modified: `git diff`

**"Verbose mode too overwhelming"**
```bash
# Use dry-run with verbose to see AI behavior without commits
gitprompt --dry-run --verbose

# Redirect verbose output to file for later review
gitprompt --verbose 2> gitprompt-debug.log

# Use verbose only when debugging specific issues
gitprompt --verbose --dry-run | grep -A 10 "SYSTEM PROMPT"
```

**"AI not following custom rules"**
- Verify rules file content is clear and specific
- Use verbose mode to see the exact prompt sent to AI
- Check that rules file doesn't contain conflicting instructions
- Test with simple rules first:
  ```text
  # Example simple .gitprompt file
  Always use "feat" for new files
  Always use "fix" for bug fixes
  Use scope "core" for src/ directory changes
  ```

**"Flag combinations not working as expected"**
```bash
# Valid combinations
gitprompt --dry-run --verbose          # ✅ Preview with details
gitprompt --yolo --dry-run            # ✅ Auto-preview all commits
gitprompt --rules ./custom.txt --verbose  # ✅ Custom rules with details

# Note: --yolo with interactive prompts is redundant but harmless
gitprompt --yolo --verbose            # ✅ Auto-commit with AI details
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

```bash
# Clone the repo
git clone https://github.com/xyassini/gitprompt.git
cd gitprompt

# Install dependencies
bun install

# Run in development
bun src/index.ts
```

### Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Use conventional commit messages

## 🔒 Security & Privacy

- **Code Analysis**: This tool analyzes your code locally and sends diff information to OpenAI's API
- **No Code Storage**: Your code is not stored by the tool or OpenAI beyond the API call
- **API Security**: Uses OpenAI's secure API endpoints
- **Local Processing**: All git operations happen locally on your machine

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for the GPT-4 API
- [isomorphic-git](https://isomorphic-git.org/) for JavaScript git operations
- [yargs](https://yargs.js.org/) for CLI argument parsing
- [yoctocolors](https://github.com/sindresorhus/yoctocolors) for terminal colors

## 📞 Support

- 🐛 [Report issues](https://github.com/xyassini/gitprompt/issues)
- 💡 [Request features](https://github.com/xyassini/gitprompt/issues)
- 📖 [Documentation](https://github.com/xyassini/gitprompt/blob/main/README.md)

---

**⭐ Star this repo if you find it helpful!**

## 🧪 Testing

The project includes comprehensive tests for all core functionality:

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch
```

### Test Coverage

- **🛠️ Utils**: Validation functions, error handling, logging
- **📊 Diff**: Line-by-line diff calculation, file change detection  
- **🔧 Git**: Status matrix parsing, configuration reading, file staging logic
- **🤖 AI**: Commit group parsing, error handling

Tests use Bun's built-in test runner with mocking for external dependencies.