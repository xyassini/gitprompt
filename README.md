# 🤖 aigito - AI-Powered Git Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logo=bun&logoColor=white)](https://bun.sh)

An intelligent CLI tool that automatically stages and commits files using AI-powered commit message generation.

> ⚠️ **Note**: This tool requires an OpenAI API key to function. It will analyze your code changes and generate commit messages using GPT-4.

## ✨ Features

- 🤖 **AI-powered commit messages** using GPT-4 with conventional commit format
- 📊 **Line-by-line diff analysis** showing exactly what changed
- 🎯 **Smart file grouping** for logical commits
- 🔍 **Detailed change tracking** (added/removed/modified lines)
- ✅ **Safety checks** to prevent conflicts with existing staged files
- 🎨 **Beautiful colored CLI** with interactive confirmations
- ⚡ **YOLO mode** for automatic commits without confirmation

## 🚀 Installation

### Prerequisites

- **Node.js** (v18+) or **Bun** (v1.0+)
- **Git** configured with user.name and user.email
- **OpenAI API key** ([Get one here](https://platform.openai.com/api-keys))

### Install from GitHub

```bash
# Clone the repository
git clone https://github.com/yourusername/aigito.git
cd aigito

# Install dependencies
bun install
# or with npm
npm install

# Make globally available (optional)
bun link
# or with npm
npm link
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
# Analyze changes and confirm each commit group
bun index.ts
# or if globally installed
aigito
```

### YOLO Mode
```bash
# Skip confirmations and commit everything automatically
bun index.ts --yolo
aigito -y
```

### Help
```bash
bun index.ts --help
aigito --help
```

## 🎬 Demo

```
🤖 aigito - AI-Powered Git Assistant

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

## CLI Output

The CLI provides beautiful colored output with:
- 🤖 **Progress indicators** for each step
- ✅ **Success messages** when operations complete
- ❌ **Error messages** with helpful context
- 📦 **Commit group previews** showing files and messages
- ❓ **Interactive prompts** for confirmation

### Example Session
```
🤖 aigito - AI-Powered Git Assistant

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
aigit/
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
3. **🤖 AI Processing**: Sends diffs to GPT-4 for intelligent file grouping and commit message generation
4. **📋 Interactive Review**: Shows each commit group and asks for confirmation
5. **📝 Staging & Committing**: Stages and commits approved groups sequentially

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/aigito.git
cd aigito

# Install dependencies
bun install

# Run in development
bun index.ts
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

- 🐛 [Report issues](https://github.com/yourusername/aigito/issues)
- 💡 [Request features](https://github.com/yourusername/aigito/issues)
- 📖 [Documentation](https://github.com/yourusername/aigito/blob/main/README.md)

---

**⭐ Star this repo if you find it helpful!**
