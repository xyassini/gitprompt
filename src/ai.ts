import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { Diff } from "../types";
import type { CommitGroup } from "./git";

const SYSTEM_PROMPTS = {
  STAGE: `
    You are a git assistant.
    You are given a list of unstaged changes.
    You are to return a list of files that make sense to stage and commit following the conventional commit format.
    Make sure to group files that make sense to commit together.
    Make the staged changes and commits small and focused.
    You are to return the filenames and commit messages in the following JSON format:

    [
      {
        "files": ["filename.txt", "filename2.txt"],
        "commitMessage": "feat(scope): description"
      },
      {
        "files": ["filename3.txt"],
        "commitMessage": "fix(scope): description"
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