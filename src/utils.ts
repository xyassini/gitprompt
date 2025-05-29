import type { StatusMatrix } from "../types";

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