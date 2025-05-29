import git from "isomorphic-git";
import fs from "fs/promises";
import { execSync } from "child_process";
import type { StatusMatrix } from "../types";

export interface GitConfig {
  authorName: string;
  authorEmail: string;
}

export interface CommitGroup {
  files: string[];
  commitMessage: string;
}

export async function getStatusMatrix(): Promise<StatusMatrix> {
  return await git.statusMatrix({
    fs,
    dir: process.cwd(),
  });
}

export function getStagedFiles(statusMatrix: StatusMatrix): StatusMatrix {
  return statusMatrix.filter(([_, head, __, stage]) => stage !== head);
}

export function getUnstagedChanges(statusMatrix: StatusMatrix): StatusMatrix {
  return statusMatrix.filter(([_, __, workdir, stage]) => workdir !== stage);
}

export function getGitConfig(): GitConfig {
  try {
    const authorName = execSync('git config --global user.name', { encoding: 'utf8' }).trim();
    const authorEmail = execSync('git config --global user.email', { encoding: 'utf8' }).trim();
    
    if (!authorName || !authorEmail) {
      throw new Error('Git config not found');
    }
    
    return { authorName, authorEmail };
  } catch (error) {
    throw new Error('Git user.name and user.email must be configured. Run:\n' +
      'git config --global user.name "Your Name"\n' +
      'git config --global user.email "your.email@example.com"');
  }
}

export async function stageFiles(files: string[]): Promise<void> {
  await git.add({
    fs,
    dir: process.cwd(),
    filepath: files,
  });
}

export async function commitChanges(
  message: string,
  config: GitConfig,
  dryRun: boolean = false
): Promise<void> {
  await git.commit({
    fs,
    dir: process.cwd(),
    message,
    author: {
      name: config.authorName,
      email: config.authorEmail,
    },
    dryRun,
  });
}

export async function processCommitGroups(
  commitGroups: CommitGroup[],
  config: GitConfig,
  dryRun: boolean = false
): Promise<void> {
  for (const commitGroup of commitGroups) {
    console.log(`Staging ${commitGroup.files.join(", ")}...`);
    await stageFiles(commitGroup.files);

    console.log(`Committing ${commitGroup.commitMessage}...`);
    await commitChanges(commitGroup.commitMessage, config, dryRun);
  }
} 