#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createInterface } from "readline";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { 
  cyan, 
  green, 
  yellow, 
  red, 
  bold, 
  dim, 
  magenta,
  blue
} from "yoctocolors";
import {
  getStatusMatrix,
  getUnstagedChanges,
  getGitConfig,
  stageFiles,
  commitChanges,
  type CommitGroup,
} from "./git.js";
import { getDiffs } from "./diff.js";
import { generateCommitGroups, parseCommitGroups } from "./ai.js";
import { validateNoStagedFiles, validateNoDiffs } from "./utils.js";

// Get version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.join(__dirname, "../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

interface CliArgs {
  yolo: boolean;
  dryRun: boolean;
  rules?: string;
}

function logProgress(message: string): void {
  console.log(cyan(`🤖 ${message}`));
}

function logSuccess(message: string): void {
  console.log(green(`✅ ${message}`));
}

function logError(message: string): void {
  console.log(red(`❌ ${message}`));
}

function logInfo(message: string): void {
  console.log(blue(`ℹ️  ${message}`));
}

async function promptConfirmation(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    const askQuestion = () => {
      rl.question(`${yellow("?")} ${message} ${dim("(y/n)")} `, (answer) => {
        const trimmed = answer.trim().toLowerCase();
        if (trimmed === 'y' || trimmed === 'yes') {
          rl.close();
          resolve(true);
        } else if (trimmed === 'n' || trimmed === 'no') {
          rl.close();
          resolve(false);
        } else {
          console.log(yellow("Please answer with y/yes or n/no"));
          askQuestion();
        }
      });
    };
    askQuestion();
  });
}

function displayCommitGroup(group: CommitGroup, index: number): void {
  console.log(`\n${bold(magenta(`📦 Commit Group ${index + 1}`))}`);
  console.log(`${bold("Message:")} ${green(group.commitMessage)}`);
  console.log(`${bold("Files:")}`);
  group.files.forEach(file => {
    console.log(`  ${dim("•")} ${cyan(file)}`);
  });
}

async function processCommitGroupsInteractive(
  commitGroups: CommitGroup[],
  config: any,
  yolo: boolean,
  dryRun: boolean
): Promise<void> {
  logInfo(`Found ${commitGroups.length} commit group(s)`);
  
  if (dryRun) {
    logInfo("DRY RUN mode - no files will be staged or committed");
  }
  
  if (yolo) {
    logInfo("YOLO mode enabled - committing all groups automatically");
  }
  
  for (const [index, group] of commitGroups.entries()) {
    displayCommitGroup(group, index);
    
    let shouldCommit = yolo;
    
    if (!yolo) {
      const action = dryRun ? "Show what would be committed for this group?" : "Commit this group?";
      shouldCommit = await promptConfirmation(action);
    }
    
    if (shouldCommit) {
      try {
        if (dryRun) {
          logInfo(`[DRY RUN] Would stage files: ${group.files.join(", ")}`);
          logInfo(`[DRY RUN] Would create commit: ${group.commitMessage}`);
          logSuccess(`[DRY RUN] Would commit: ${group.commitMessage}`);
        } else {
          logProgress(`Staging files: ${group.files.join(", ")}`);
          await stageFiles(group.files, dryRun);
          
          logProgress(`Creating commit: ${group.commitMessage}`);
          await commitChanges(group.commitMessage, config, dryRun);
          
          logSuccess(`Committed: ${group.commitMessage}`);
        }
      } catch (error) {
        logError(`Failed to commit group ${index + 1}: ${error}`);
        throw error;
      }
    } else {
      const skipMessage = dryRun ? `Skipped showing commit group ${index + 1}` : `Skipped commit group ${index + 1}`;
      console.log(dim(skipMessage));
    }
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .usage(bold(cyan("🤖 gitprompt - AI-Powered Git Assistant")))
    .option("yolo", {
      alias: "y",
      type: "boolean",
      default: false,
      description: "Skip confirmations and commit everything automatically"
    })
    .option("dry-run", {
      alias: "d",
      type: "boolean",
      default: false,
      description: "Show what would be done without actually staging or committing files"
    })
    .option("rules", {
      alias: "r",
      type: "string",
      description: "Path to custom rules file (instead of .gitprompt)"
    })
    .help()
    .version(packageJson.version)
    .parseAsync() as CliArgs;

  console.log(bold(cyan("\n🤖 gitprompt - AI-Powered Git Assistant\n")));

  if (argv.dryRun) {
    console.log(yellow("🧪 DRY RUN MODE: No files will be staged or committed\n"));
  }

  try {
    logProgress("Analyzing repository status...");
    const statusMatrix = await getStatusMatrix();

    // Validate that there are no staged files
    validateNoStagedFiles(statusMatrix);

    // Get git config for author information
    const gitConfig = getGitConfig();

    // Filter for unstaged changes
    const unstagedChanges = getUnstagedChanges(statusMatrix);

    logProgress("Calculating diffs...");
    const diffs = await getDiffs(unstagedChanges);
    
    // Validate that there are changes to process
    validateNoDiffs(diffs.length);
    
    logSuccess(`Found ${diffs.length} file(s) with changes`);

    logProgress("Generating intelligent commit groups...");
    const aiResponse = await generateCommitGroups(diffs, argv.rules);

    logProgress("Parsing AI recommendations...");
    const commitGroups = parseCommitGroups(aiResponse);

    // Process commit groups with interactive confirmation
    await processCommitGroupsInteractive(commitGroups, gitConfig, argv.yolo, argv.dryRun);

    const finalMessage = argv.dryRun ? "Dry run completed! 🎉" : "All done! 🎉";
    logSuccess(finalMessage);

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Staged files detected" || error.message === "No changes detected") {
        // These are expected early exits
        return;
      }
    }
    logError(`An error occurred: ${error}`);
    process.exit(1);
  }
}

main(); 