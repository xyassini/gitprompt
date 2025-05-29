import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getCurrentBranch, type CommitGroup } from "./git";
import type { Diff } from "./types";
import fs from "fs/promises";
import path from "path";

// AI integration module for intelligent commit generation

/**
 * Find the git repository root by walking up the directory tree
 * looking for a .git folder
 */
export async function findGitRoot(startDir: string = process.cwd()): Promise<string | null> {
  let currentDir = startDir;
  
  while (currentDir !== path.dirname(currentDir)) {
    try {
      const gitPath = path.join(currentDir, '.git');
      const stats = await fs.stat(gitPath);
      if (stats.isDirectory() || stats.isFile()) {
        return currentDir;
      }
    } catch (error) {
      // .git not found in this directory, continue up
    }
    currentDir = path.dirname(currentDir);
  }
  
  return null;
}

/**
 * Read rules from a custom file path
 */
export async function readRulesFile(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content.trim();
  } catch (error) {
    throw new Error(`Failed to read rules file at ${filePath}: ${error}`);
  }
}

/**
 * Read the .gitprompt file from the git repository root if it exists
 */
export async function readGitPromptFile(): Promise<string> {
  try {
    const gitRoot = await findGitRoot();
    if (!gitRoot) {
      return "";
    }
    
    const gitPromptPath = path.join(gitRoot, '.gitprompt');
    const content = await fs.readFile(gitPromptPath, 'utf8');
    return content.trim();
  } catch (error) {
    // File doesn't exist or can't be read
    return "";
  }
}

const SYSTEM_PROMPTS = {
  STAGE: (additionalContext?: string, userRules?: string) => `
    You are a git assistant that analyzes code changes and generates intelligent commit messages.
    
    DIFF FORMAT:
    Each file includes a "diffText" field with unified diff format:
    - Lines starting with "-" are REMOVED (old content)
    - Lines starting with "+" are ADDED (new content)  
    - Lines starting with " " (space) are UNCHANGED (context)
    
    ANALYSIS RULES:
    1. For changeType "modified" files - Use ONLY these commit types:
       - "refactor" - when improving/changing existing code structure without changing or adding new functionality
       - "fix" - when fixing bugs in existing code  
       - "chore" - when updating config, removing unused code, or maintenance
       - "feat" - when adding new functionality or changing existing functionality
    
    2. For changeType "added" files (new files) - Use "feat" if it's genuinely new functionality
    
    3. For changeType "deleted" files - Use "chore" or "refactor"

    4. If the modifications look like it is fixing something, use "fix" instead of "refactor"

    5. If the modifications also include small things like reordering imports, restructuring imports, or small changes to the code, no need to mention the reordering, restructuring or small change it in the commit message unless it's the only change in the file.
    
    EXAMPLES:
    - Modified ai.ts with prompt changes → "feat(ai): improve system prompt analysis"
    - Modified types.ts removing property → "refactor(types): remove unused workdir property"
    - Modified function logic without adding new functionality → "refactor(module): update function implementation"
    - Modified function logic with adding new functionality → "feat(module): add new functionality"
    - Modified fucntion logic with removing functionality → "feat(module): remove functionality"
    - Modified function logic with changing functionality → "feat(module): change functionality"
    - New file added → "feat(module): add new functionality"
    
    Keep messages short and accurate. Focus on WHAT changed, not imaginary new features.
    It is okay to group multiple files together in a commit if they are related to the same feature, fix or refactor, but don't put multiple features in the same commit.
    Example:
    This is not okay (1 commit):
      - feat(context): add support for additional context and user rules from .gitprompt file, and implement dry-run mode
    This is okay (2 commits):
      - feat(context): add support for additional context and user rules from .gitprompt file
      - feat(context): implement dry-run mode
    
    Return JSON format:
    [{"files": ["file.ts"], "commitMessage": "refactor(scope): what was actually changed"}]

    ${additionalContext ? `Additional context:
      ${additionalContext}` : ""}

    ${userRules ? `User rules:
      ${userRules}` : ""}

      -----
      Do not reply with anything other than the JSON format.
    
    `,
};

export async function generateCommitGroups(diffs: Diff[], rulesFilePath?: string): Promise<string> {
  const branch = await getCurrentBranch();

  const additionalContext = `
    Current branch: ${branch}
  `;
  
  // Read user rules from custom file path or default .gitprompt file
  const userRules = rulesFilePath ? await readRulesFile(rulesFilePath) : await readGitPromptFile();
  
  const response = await generateText({
    model: openai("gpt-4.1-mini"),
    system: SYSTEM_PROMPTS.STAGE(additionalContext, userRules),
    prompt: JSON.stringify(diffs, null, 2),
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
