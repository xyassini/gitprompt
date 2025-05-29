# AI Git Tool

An intelligent git assistant that automatically stages and commits files using AI-powered commit message generation.

## Features

- 🤖 **AI-powered commit messages** using GPT-4 with conventional commit format
- 📊 **Line-by-line diff analysis** showing exactly what changed
- 🎯 **Smart file grouping** for logical commits
- 🔍 **Detailed change tracking** (added/removed/modified lines)
- ✅ **Safety checks** to prevent conflicts with existing staged files

## Project Structure

```
aigit/
├── src/
│   ├── git.ts      # Git operations (status, staging, committing)
│   ├── diff.ts     # Diff calculation and file content analysis
│   ├── ai.ts       # AI integration for commit message generation
│   └── utils.ts    # Validation and utility functions
├── types.ts        # Type definitions
├── index.ts        # Main orchestration file
└── package.json
```

## Module Documentation

### `src/git.ts`
Handles all git-related operations:
- **`getStatusMatrix()`** - Gets current git status
- **`getUnstagedChanges()`** - Filters for unstaged files
- **`getGitConfig()`** - Reads global git configuration
- **`stageFiles()`** - Stages specific files
- **`commitChanges()`** - Creates commits with author info
- **`processCommitGroups()`** - Orchestrates staging and committing

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
- **`logProgress()`** / **`logError()`** - Consistent logging

## How It Works

1. **🔍 Status Check**: Reads git status and validates no files are already staged
2. **📊 Diff Analysis**: Calculates line-by-line diffs for all unstaged files
3. **🤖 AI Processing**: Sends diffs to GPT-4 for intelligent file grouping and commit message generation
4. **📝 Staging & Committing**: Automatically stages and commits files according to AI recommendations

## Usage

```bash
# Install dependencies
bun install

# Run the tool (dry-run mode by default)
bun run index.ts
```

### Configuration

- **Dry Run**: Set `dryRun = false` in `index.ts` to actually commit changes
- **AI Model**: Configured to use GPT-4.1, can be changed in `src/ai.ts`
- **Git Config**: Uses your global git user.name and user.email

## Example Output

The tool provides detailed JSON output showing:

```json
{
  "filename": "example.ts",
  "changeType": "modified",
  "lineChanges": [
    {
      "lineNumber": 5,
      "type": "modified",
      "oldContent": "const old = 'value';",
      "newContent": "const new = 'updated';"
    },
    {
      "lineNumber": 10,
      "type": "added",
      "newContent": "// Added this comment"
    }
  ]
}
```

## Safety Features

- ✅ Prevents running when files are already staged
- ✅ Validates git configuration before proceeding
- ✅ Dry-run mode by default to preview changes
- ✅ Detailed error handling and user feedback

## Requirements

- Node.js/Bun
- Git configured with user.name and user.email
- OpenAI API key for GPT-4 access

This project was created using `bun init` in bun v1.2.12. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
