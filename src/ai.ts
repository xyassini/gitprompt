import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { CommitGroup } from "./git";
import type { Diff } from "./types";

// AI integration module for intelligent commit generation
const SYSTEM_PROMPTS = {
  STAGE: `
    You are a git assistant that analyzes code changes and generates intelligent commit messages.
    
    CRITICAL RULE: If a file has changeType "modified", you are MODIFYING existing code, NOT adding new features.
    
    ANALYSIS RULES:
    1. For changeType "modified" files - Use ONLY these commit types:
       - "refactor" - when improving/changing existing code structure or logic
       - "fix" - when fixing bugs in existing code  
       - "chore" - when updating config, removing unused code, or maintenance
       - NEVER use "feat" or words like "add", "implement", "create" for modified files
    
    2. For changeType "added" files (new files) - Use "feat" if it's genuinely new functionality
    
    3. For changeType "deleted" files - Use "chore" or "refactor"
    
    FORBIDDEN WORDS for modified files:
    - "add", "implement", "create", "introduce", "establish", "build"
    
    REQUIRED WORDS for modified files:
    - "update", "improve", "change", "modify", "refactor", "fix", "adjust"
    
    EXAMPLES:
    - Modified ai.ts with prompt changes → "refactor(ai): improve system prompt analysis"
    - Modified types.ts removing property → "refactor(types): remove unused workdir property"
    - Modified function logic → "refactor(module): update function implementation"
    - New file added → "feat(module): add new functionality"
    
    Keep messages short and accurate. Focus on WHAT changed, not imaginary new features.
    
    Return JSON format:
    [{"files": ["file.ts"], "commitMessage": "refactor(scope): what was actually changed"}]
    `,
};

export async function generateCommitGroups(diffs: Diff[]): Promise<string> {
  const response = await generateText({
    model: openai("gpt-4.1"),
    system: SYSTEM_PROMPTS.STAGE,
    prompt: JSON.stringify(diffs, null, 2),
  });
  console.log(JSON.stringify(diffs, null, 2))

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
