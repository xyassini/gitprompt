import { describe, it, expect, spyOn, beforeEach, afterEach } from "bun:test";
import { validateNoStagedFiles, validateNoDiffs, logProgress, logError } from "./utils";
import type { StatusMatrix } from "./types";

describe("utils", () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = {
      log: spyOn(console, "log"),
      error: spyOn(console, "error"),
    };
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe("validateNoStagedFiles", () => {
    it("should pass when no files are staged", () => {
      const statusMatrix: StatusMatrix = [
        ["file1.txt", 1, 2, 1], // modified but not staged
        ["file2.txt", 0, 2, 0], // untracked
        ["file3.txt", 1, 1, 1], // unmodified
      ];

      expect(() => validateNoStagedFiles(statusMatrix)).not.toThrow();
    });

    it("should throw when files are staged", () => {
      const statusMatrix: StatusMatrix = [
        ["file1.txt", 1, 2, 2], // staged
        ["file2.txt", 0, 2, 2], // staged new file
      ];

      expect(() => validateNoStagedFiles(statusMatrix)).toThrow("Staged files detected");
      expect(consoleSpy.error).toHaveBeenCalledWith("Error: There are already staged files. Please commit or unstage them first:");
      expect(consoleSpy.error).toHaveBeenCalledWith("  - file1.txt");
      expect(consoleSpy.error).toHaveBeenCalledWith("  - file2.txt");
    });

    it("should provide helpful instructions when files are staged", () => {
      const statusMatrix: StatusMatrix = [["staged.txt", 0, 2, 2]];

      expect(() => validateNoStagedFiles(statusMatrix)).toThrow();
      expect(consoleSpy.error).toHaveBeenCalledWith("\nTo unstage files, run: git reset");
      expect(consoleSpy.error).toHaveBeenCalledWith("To commit staged files, run: git commit");
    });
  });

  describe("validateNoDiffs", () => {
    it("should pass when there are diffs", () => {
      expect(() => validateNoDiffs(3)).not.toThrow();
      expect(() => validateNoDiffs(1)).not.toThrow();
    });

    it("should throw when there are no diffs", () => {
      expect(() => validateNoDiffs(0)).toThrow("No changes detected");
      expect(consoleSpy.log).toHaveBeenCalledWith("No diffs found");
    });
  });

  describe("logProgress", () => {
    it("should log progress messages", () => {
      logProgress("Testing progress");
      expect(consoleSpy.log).toHaveBeenCalledWith("Testing progress");
    });
  });

  describe("logError", () => {
    it("should log error messages", () => {
      logError("Test error");
      expect(consoleSpy.error).toHaveBeenCalledWith("Test error");
    });

    it("should log error with additional error object", () => {
      const error = new Error("Additional error");
      logError("Test error", error);
      expect(consoleSpy.error).toHaveBeenCalledWith("Test error");
      expect(consoleSpy.error).toHaveBeenCalledWith(error);
    });
  });
}); 