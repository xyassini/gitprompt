import { describe, it, expect, mock, beforeEach } from "bun:test";
import { getStagedFiles, getUnstagedChanges, getGitConfig } from "./git";
import type { HeadStatus, WorkdirStatus, StageStatus } from "isomorphic-git";
import type { StatusMatrix } from "./types";

// Mock execSync for getGitConfig tests
const mockExecSync = mock(() => "test-value");
mock.module("child_process", () => ({ execSync: mockExecSync }));

describe("git", () => {
  beforeEach(() => {
    mockExecSync.mockClear();
  });

  describe("getStagedFiles", () => {
    it("should return empty array when no files are staged", () => {
      const statusMatrix: StatusMatrix = [
        ["file1.txt", 1 as HeadStatus, 2 as WorkdirStatus, 1 as StageStatus], // modified but not staged
        ["file2.txt", 0 as HeadStatus, 2 as WorkdirStatus, 0 as StageStatus], // untracked
        ["file3.txt", 1 as HeadStatus, 1 as WorkdirStatus, 1 as StageStatus], // unmodified
      ];

      const result = getStagedFiles(statusMatrix);

      expect(result).toHaveLength(0);
    });

    it("should return staged files", () => {
      const statusMatrix: StatusMatrix = [
        ["staged1.txt", 1 as HeadStatus, 2 as WorkdirStatus, 2 as StageStatus], // staged
        ["staged2.txt", 0 as HeadStatus, 2 as WorkdirStatus, 2 as StageStatus], // staged new file
        ["unstaged.txt", 1 as HeadStatus, 2 as WorkdirStatus, 1 as StageStatus], // not staged
      ];

      const result = getStagedFiles(statusMatrix);

      expect(result).toHaveLength(2);
      expect(result[0]?.[0]).toBe("staged1.txt");
      expect(result[1]?.[0]).toBe("staged2.txt");
    });

    it("should handle deleted staged files", () => {
      const statusMatrix: StatusMatrix = [
        ["deleted.txt", 1 as HeadStatus, 0 as WorkdirStatus, 0 as StageStatus], // deleted and staged
      ];

      const result = getStagedFiles(statusMatrix);

      expect(result).toHaveLength(1);
      expect(result[0]?.[0]).toBe("deleted.txt");
    });
  });

  describe("getUnstagedChanges", () => {
    it("should return files with unstaged changes", () => {
      const statusMatrix: StatusMatrix = [
        ["modified.txt", 1 as HeadStatus, 2 as WorkdirStatus, 1 as StageStatus], // modified, unstaged
        ["new.txt", 0 as HeadStatus, 2 as WorkdirStatus, 0 as StageStatus], // new, untracked
        ["staged.txt", 1 as HeadStatus, 2 as WorkdirStatus, 2 as StageStatus], // staged, no unstaged changes
        ["unmodified.txt", 1 as HeadStatus, 1 as WorkdirStatus, 1 as StageStatus], // no changes
      ];

      const result = getUnstagedChanges(statusMatrix);

      expect(result).toHaveLength(2);
      expect(result[0]?.[0]).toBe("modified.txt");
      expect(result[1]?.[0]).toBe("new.txt");
    });

    it("should return empty array when no unstaged changes", () => {
      const statusMatrix: StatusMatrix = [
        ["staged.txt", 1 as HeadStatus, 2 as WorkdirStatus, 2 as StageStatus], // staged
        ["unmodified.txt", 1 as HeadStatus, 1 as WorkdirStatus, 1 as StageStatus], // unmodified
      ];

      const result = getUnstagedChanges(statusMatrix);

      expect(result).toHaveLength(0);
    });

    it("should handle deleted files", () => {
      const statusMatrix: StatusMatrix = [
        ["deleted.txt", 1 as HeadStatus, 0 as WorkdirStatus, 1 as StageStatus], // deleted, unstaged
      ];

      const result = getUnstagedChanges(statusMatrix);

      expect(result).toHaveLength(1);
      expect(result[0]?.[0]).toBe("deleted.txt");
    });
  });

  describe("getGitConfig", () => {
    it("should return git config when both name and email are available", () => {
      mockExecSync
        .mockReturnValueOnce("John Doe\n")
        .mockReturnValueOnce("john@example.com\n");

      const result = getGitConfig();

      expect(result).toEqual({
        authorName: "John Doe",
        authorEmail: "john@example.com",
      });
      expect(mockExecSync).toHaveBeenCalledWith("git config --global user.name", { encoding: "utf8" });
      expect(mockExecSync).toHaveBeenCalledWith("git config --global user.email", { encoding: "utf8" });
    });

    it("should throw error when name is missing", () => {
      mockExecSync
        .mockReturnValueOnce("")
        .mockReturnValueOnce("john@example.com\n");

      expect(() => getGitConfig()).toThrow("Git user.name and user.email must be configured");
    });

    it("should throw error when email is missing", () => {
      mockExecSync
        .mockReturnValueOnce("John Doe\n")
        .mockReturnValueOnce("");

      expect(() => getGitConfig()).toThrow("Git user.name and user.email must be configured");
    });

    it("should throw error when execSync fails", () => {
      mockExecSync.mockImplementation(() => {
        throw new Error("Git not found");
      });

      expect(() => getGitConfig()).toThrow("Git user.name and user.email must be configured");
    });

    it("should trim whitespace from git config values", () => {
      mockExecSync
        .mockReturnValueOnce("  John Doe  \n")
        .mockReturnValueOnce("  john@example.com  \n");

      const result = getGitConfig();

      expect(result.authorName).toBe("John Doe");
      expect(result.authorEmail).toBe("john@example.com");
    });
  });
}); 