import {
  getStatusMatrix,
  getUnstagedChanges,
  getGitConfig,
  processCommitGroups,
} from "./src/git";
import { getDiffs } from "./src/diff";
import { generateCommitGroups, parseCommitGroups } from "./src/ai";
import { validateNoStagedFiles, validateNoDiffs, logProgress, logError } from "./src/utils";

async function main() {
  try {
    logProgress("Getting unstaged changes...");
    const statusMatrix = await getStatusMatrix();

    // Validate that there are no staged files
    validateNoStagedFiles(statusMatrix);

    // Get git config for author information
    const gitConfig = getGitConfig();

    // Filter for unstaged changes
    const unstagedChanges = getUnstagedChanges(statusMatrix);

    logProgress("Getting diffs...");
    const diffs = await getDiffs(unstagedChanges);
    
    // Validate that there are changes to process
    validateNoDiffs(diffs.length);
    
    console.log(diffs);

    logProgress("Generating commits...");
    const aiResponse = await generateCommitGroups(diffs);

    logProgress("Parsing commits...");
    const commitGroups = parseCommitGroups(aiResponse);
    console.log(commitGroups);

    logProgress("Committing...");
    await processCommitGroups(commitGroups, gitConfig);

    logProgress("Process completed successfully!");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Staged files detected" || error.message === "No changes detected") {
        // These are expected early exits, don't log as errors
        return;
      }
    }
    logError("An error occurred:", error);
    process.exit(1);
  }
}

main();
