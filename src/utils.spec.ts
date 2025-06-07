import { describe, it, expect, spyOn, beforeEach, afterEach } from "bun:test";
import { validateNoStagedFiles, validateNoDiffs, logProgress, logError, estimateTokens, calculateTotalTokens } from "./utils";
import type { StatusMatrix, Diff } from "./types";

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

  describe("token counting", () => {
    describe("estimateTokens", () => {
      it("should return 0 for empty string", () => {
        expect(estimateTokens("")).toBe(0);
        expect(estimateTokens("   ")).toBe(1); // 3 chars / 4 = 0.75, ceil = 1
      });

      it("should estimate tokens based on character count", () => {
        expect(estimateTokens("hello")).toBe(2); // 5 chars / 4 = 1.25, ceil = 2
        expect(estimateTokens("hello world")).toBe(3); // 11 chars / 4 = 2.75, ceil = 3
        expect(estimateTokens("a".repeat(100))).toBe(25); // 100 chars / 4 = 25
      });

      it("should handle null or undefined input", () => {
        expect(estimateTokens(null as any)).toBe(0);
        expect(estimateTokens(undefined as any)).toBe(0);
      });
    });

    describe("calculateTotalTokens", () => {
      it("should calculate total tokens for system prompt and diffs", () => {
        const systemPrompt = "test prompt"; // 11 chars = 3 tokens
        const diffs: Diff[] = [
          {
            filename: "test.ts",
            changeType: "modified",
            diffText: "+console.log('test');",
            isBinary: false
          }
        ];

        const result = calculateTotalTokens(systemPrompt, diffs);
        
        // Should be system prompt tokens + JSON representation tokens
        expect(result).toBeGreaterThan(3); // At least the system prompt tokens
        expect(typeof result).toBe("number");
      });

      it("should handle empty diffs array", () => {
        const systemPrompt = "test prompt";
        const diffs: Diff[] = [];

        const result = calculateTotalTokens(systemPrompt, diffs);
        
        expect(result).toBeGreaterThan(0);
        expect(typeof result).toBe("number");
      });

      it("should handle binary files in diffs", () => {
        const systemPrompt = "test prompt";
        const diffs: Diff[] = [
          {
            filename: "image.png",
            changeType: "added",
            diffText: "Binary file added",
            isBinary: true
          }
        ];

        const result = calculateTotalTokens(systemPrompt, diffs);
        
        expect(result).toBeGreaterThan(0);
        expect(typeof result).toBe("number");
      });
    });
  });
}); 