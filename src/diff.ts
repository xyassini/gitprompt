import git, { type HeadStatus, type WorkdirStatus, type StageStatus } from "isomorphic-git";
import fs from "fs/promises";
import path from "path";
import type { Diff, StatusMatrix } from "./types";

// Common binary file extensions
const BINARY_EXTENSIONS = new Set([
  // Images
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.ico', '.svg', '.tiff', '.tif',
  // Videos
  '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v',
  // Audio
  '.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a',
  // Archives
  '.zip', '.tar', '.gz', '.bz2', '.7z', '.rar', '.xz',
  // Documents
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  // Executables
  '.exe', '.dll', '.so', '.dylib', '.bin', '.app',
  // Fonts
  '.ttf', '.otf', '.woff', '.woff2', '.eot',
  // Other
  '.sqlite', '.db', '.iso', '.dmg', '.pkg', '.deb', '.rpm'
]);

/**
 * Check if a file is binary based on its extension
 */
function isBinaryByExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

/**
 * Check if content is binary by looking for null bytes and non-printable characters
 */
function isBinaryByContent(content: string): boolean {
  if (content.length === 0) return false;
  
  // Check for null bytes (strong indicator of binary content)
  if (content.includes('\0')) return true;
  
  // Check for high percentage of non-printable characters
  // Sample first 8KB of content for performance
  const sampleSize = Math.min(content.length, 8192);
  const sample = content.substring(0, sampleSize);
  
  let nonPrintableCount = 0;
  for (let i = 0; i < sample.length; i++) {
    const charCode = sample.charCodeAt(i);
    // Consider chars outside printable ASCII range (except common whitespace)
    if (charCode < 32 && charCode !== 9 && charCode !== 10 && charCode !== 13) {
      nonPrintableCount++;
    } else if (charCode > 126) {
      nonPrintableCount++;
    }
  }
  
  // If more than 30% of characters are non-printable, consider it binary
  return (nonPrintableCount / sample.length) > 0.3;
}

/**
 * Determine if a file is binary based on filename and content
 */
function isBinaryFile(filename: string, stagedContent: string, workdirContent: string): boolean {
  // First check by extension for performance
  if (isBinaryByExtension(filename)) {
    return true;
  }
  
  // Then check content if we have any
  if (stagedContent && isBinaryByContent(stagedContent)) {
    return true;
  }
  
  if (workdirContent && isBinaryByContent(workdirContent)) {
    return true;
  }
  
  return false;
}

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
  const isBinary = isBinaryFile(filename, stagedContent, workdirContent);
  
  let diffText: string;
  if (isBinary) {
    // For binary files, provide metadata instead of diff content
    diffText = `Binary file ${changeType}`;
  } else {
    diffText = generateUnifiedDiff(stagedContent, workdirContent);
  }

  return {
    filename,
    changeType,
    diffText,
    isBinary,
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