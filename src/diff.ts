import git, { type HeadStatus, type WorkdirStatus, type StageStatus } from "isomorphic-git";
import fs from "fs/promises";
import type { Diff, StatusMatrix } from "./types";

export function generateUnifiedDiff(staged: string, workdir: string): string {
  const stagedLines = staged === '' ? [] : staged.split('\n');
  const workdirLines = workdir === '' ? [] : workdir.split('\n');
  const diffLines: string[] = [];
  
  const maxLines = Math.max(stagedLines.length, workdirLines.length);
  
  for (let i = 0; i < maxLines; i++) {
    const stagedLine = stagedLines[i];
    const workdirLine = workdirLines[i];
    
    if (stagedLine === undefined && workdirLine !== undefined) {
      // Line was added
      diffLines.push(`+${workdirLine}`);
    } else if (stagedLine !== undefined && workdirLine === undefined) {
      // Line was removed
      diffLines.push(`-${stagedLine}`);
    } else if (stagedLine !== workdirLine) {
      // Line was modified - show as removal then addition
      diffLines.push(`-${stagedLine}`);
      diffLines.push(`+${workdirLine}`);
    } else {
      // Line unchanged - show without prefix
      diffLines.push(` ${stagedLine}`);
    }
  }
  
  return diffLines.join('\n');
}

async function readStagedContent(filename: string): Promise<string> {
  try {
    // First resolve HEAD to get the actual commit SHA
    const headSha = await git.resolveRef({
      fs,
      dir: process.cwd(),
      ref: 'HEAD'
    });
    
    // Now read the blob using the resolved SHA
    const stagedBlob = await git.readBlob({
      fs,
      dir: process.cwd(),
      oid: headSha,
      filepath: filename,
    });
    // Convert Uint8Array to string properly using TextDecoder
    return new TextDecoder().decode(stagedBlob.blob);
  } catch (error) {
    // If file doesn't exist in HEAD (newly added file), return empty
    return "";
  }
}

async function readWorkdirContent(filename: string): Promise<string> {
  try {
    const workdirBuffer = await fs.readFile(`${process.cwd()}/${filename}`);
    return workdirBuffer.toString();
  } catch (error) {
    // File might be deleted
    return "";
  }
}

function determineChangeType(head: HeadStatus, workdir: WorkdirStatus, stage: StageStatus): string {
  if (head === 0 && stage === 0) {
    return "untracked";
  } else if (workdir === 0) {
    return "deleted";
  } else if (head === 0) {
    return "added";
  }
  return "modified";
}

export async function calculateDiffForFile(
  filename: string,
  head: HeadStatus,
  workdir: WorkdirStatus,
  stage: StageStatus
): Promise<Diff> {
  let stagedContent = "";
  let workdirContent = "";

  // Get staged content if file is in stage
  if (stage !== 0) {
    stagedContent = await readStagedContent(filename);
  }

  // Get working directory content if file exists in workdir
  if (workdir !== 0) {
    workdirContent = await readWorkdirContent(filename);
  }

  const changeType = determineChangeType(head, workdir, stage);
  const diffText = generateUnifiedDiff(stagedContent, workdirContent);

  return {
    filename,
    changeType,
    diffText,
  };
}

export async function getDiffs(unstagedChanges: StatusMatrix): Promise<Diff[]> {
  const diffs: Diff[] = [];

  for (const [filename, head, workdir, stage] of unstagedChanges) {
    try {
      const diff = await calculateDiffForFile(filename, head, workdir, stage);
      diffs.push(diff);
    } catch (error) {
      console.error(`Error getting diff for ${filename}:`, error);
    }
  }

  return diffs;
} 