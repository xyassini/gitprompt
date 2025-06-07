import type { StatusMatrix, Diff } from "./types";

export function validateNoStagedFiles(statusMatrix: StatusMatrix): void {
  const stagedFiles = statusMatrix.filter(([_, head, __, stage]) => stage !== head);
  
  if (stagedFiles.length > 0) {
    console.error("Error: There are already staged files. Please commit or unstage them first:");
    stagedFiles.forEach(([filename]) => {
      console.error(`  - ${filename}`);
    });
    console.error("\nTo unstage files, run: git reset");
    console.error("To commit staged files, run: git commit");
    throw new Error("Staged files detected");
  }
}

export function validateNoDiffs(diffCount: number): void {
  if (diffCount === 0) {
    console.log("No diffs found");
    throw new Error("No changes detected");
  }
}

export function logProgress(message: string): void {
  console.log(message);
}

export function logError(message: string, error?: unknown): void {
  console.error(message);
  if (error) {
    console.error(error);
  }
}

/**
 * Estimate the number of tokens in a text string
 * Uses a rough approximation: 1 token ≈ 4 characters for English text
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  
  // Basic estimation: 1 token ≈ 4 characters
  // This is a conservative estimate for GPT models
  return Math.ceil(text.length / 4);
}

/**
 * Calculate the total estimated tokens for system prompt and diff data
 */
export function calculateTotalTokens(systemPrompt: string, diffs: Diff[]): number {
  const systemPromptTokens = estimateTokens(systemPrompt);
  
  // Convert diffs to JSON string to estimate the prompt size
  const diffsJson = JSON.stringify(diffs, null, 2);
  const diffsTokens = estimateTokens(diffsJson);
  
  return systemPromptTokens + diffsTokens;
}

/**
 * Validate that the token count is within the specified limit
 * If it exceeds the limit, provide helpful information about the token usage
 */
export async function validateTokenLimit(
  totalTokens: number, 
  maxTokens: number, 
  verbose: boolean = false
): Promise<boolean> {
  if (verbose) {
    console.log(`🔢 Estimated tokens: ${totalTokens} / ${maxTokens} limit`);
  }
  
  if (totalTokens <= maxTokens) {
    return true;
  }
  
  // Token limit exceeded - ask user for confirmation
  console.log(`\n⚠️  Token limit exceeded!`);
  console.log(`   Estimated tokens: ${totalTokens}`);
  console.log(`   Maximum allowed: ${maxTokens}`);
  console.log(`   Overage: ${totalTokens - maxTokens} tokens\n`);
  
  console.log(`💡 This may result in:`);
  console.log(`   - Higher API costs`);
  console.log(`   - Slower processing`);
  console.log(`   - Potential context truncation\n`);
  
  // Import readline here to avoid circular dependencies
  const { createInterface } = await import("readline");
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    const askQuestion = () => {
      rl.question(`Do you want to continue anyway? (y/n) `, (answer) => {
        const trimmed = answer.trim().toLowerCase();
        if (trimmed === 'y' || trimmed === 'yes') {
          rl.close();
          resolve(true);
        } else if (trimmed === 'n' || trimmed === 'no') {
          rl.close();
          resolve(false);
        } else {
          console.log("Please answer with y/yes or n/no");
          askQuestion();
        }
      });
    };
    askQuestion();
  });
} 