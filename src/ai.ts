import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { CommitGroup } from "./git";
import type { Diff } from "./types";

// AI integration module for intelligent commit generation
const SYSTEM_PROMPTS = {
  STAGE: `
    You are a git assistant that analyzes code changes and generates intelligent commit messages.
    
    IMPORTANT: You will receive detailed diff information including:
    - File names
    - Change types (added, modified, deleted, untracked)
    - Line-by-line changes showing exactly what was added, removed, or modified
    
    INSTRUCTIONS:
    1. CAREFULLY ANALYZE the actual line changes (lineChanges) to understand what was modified
    2. Look at the content being added/removed/changed, not just the filenames
    3. Generate commit messages that accurately describe the ACTUAL changes made
    4. Group related changes together logically
    5. Use conventional commit format: type(scope): description
    6. Make commits small and focused
    7. Keep the commit messages short and concise.
    
    EXAMPLES OF GOOD ANALYSIS:
    - If package.json adds new dependencies → "chore(deps): add yargs and yoctocolors for CLI functionality"
    - If package.json adds bin config → "chore(config): add CLI binary configuration for aigito command"
    - If new files are created → "feat(module): add new functionality"
    - If documentation is updated → "docs: update README with new features"
    
    DO NOT make assumptions based only on filenames. Always analyze the actual content changes.
    
    Return the filenames and commit messages in the following JSON format:
    [
      {
        "files": ["filename.txt", "filename2.txt"],
        "commitMessage": "feat(scope): description of what was actually changed"
      },
      {
        "files": ["filename3.txt"],
        "commitMessage": "fix(scope): description of what was actually fixed"
      }
    ]
    `,
};

export async function generateCommitGroups(diffs: Diff[]): Promise<string> {
  const response = await generateText({
    model: openai("gpt-4.1"),
    messages: [
      { role: "system", content: SYSTEM_PROMPTS.STAGE },
      { role: "user", content: JSON.stringify(diffs, null, 2) },
    ],
  });

  return response.text;
}

export function parseCommitGroups(responseText: string): CommitGroup[] {
  try {
    const commitGroups: CommitGroup[] = JSON.parse(responseText);
    return commitGroups;
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error}`);
  }
} 