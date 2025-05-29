# 🤖 aigito - AI-Powered Git Assistant

An intelligent CLI tool that automatically stages and commits files using AI-powered commit message generation.

## Features

- 🤖 **AI-powered commit messages** using GPT-4 with conventional commit format
- 📊 **Line-by-line diff analysis** showing exactly what changed
- 🎯 **Smart file grouping** for logical commits
- 🔍 **Detailed change tracking** (added/removed/modified lines)
- ✅ **Safety checks** to prevent conflicts with existing staged files
- 🎨 **Beautiful colored CLI** with interactive confirmations
- ⚡ **YOLO mode** for automatic commits without confirmation

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd aigit

# Install dependencies
bun install

# Make the CLI globally available (optional)
bun link
```

## Usage

### Interactive Mode (Default)
```bash
# Analyze changes and confirm each commit group
aigito

# Or run directly with bun
bun cli.ts
```

### YOLO Mode
```bash
# Skip confirmations and commit everything automatically
aigito --yolo
aigito -y
```

### Help
```bash
aigito --help
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
