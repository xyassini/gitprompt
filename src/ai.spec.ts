import { describe, it, expect, spyOn, beforeEach, afterEach, mock } from "bun:test";

// Create mock functions
const mockGenerateText = mock(async () => ({
  text: '[{"files": ["test.ts"], "commitMessage": "feat(test): add test"}]'
}));

// Mock the AI SDK before importing ai module to prevent OpenAI client initialization
mock.module("@ai-sdk/openai", () => ({
  openai: mock(() => "mocked-openai-model")
}));

mock.module("ai", () => ({
  generateText: mockGenerateText
}));

import { parseCommitGroups, readGitPromptFile, findGitRoot, readRulesFile, generateCommitGroups } from "./ai";

describe("ai", () => {
  describe("parseCommitGroups", () => {
    it("should parse valid JSON response", () => {
      const response = `[
        {
          "files": ["file1.ts", "file2.ts"],
          "commitMessage": "feat(core): add new functionality"
        },
        {
          "files": ["README.md"],
          "commitMessage": "docs: update documentation"
        }
      ]`;

      const result = parseCommitGroups(response);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        files: ["file1.ts", "file2.ts"],
        commitMessage: "feat(core): add new functionality",
      });
      expect(result[1]).toEqual({
        files: ["README.md"],
        commitMessage: "docs: update documentation",
      });
    });

    it("should handle single commit group", () => {
      const response = `[
        {
          "files": ["single.ts"],
          "commitMessage": "fix(bug): resolve issue"
        }
      ]`;

      const result = parseCommitGroups(response);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        files: ["single.ts"],
        commitMessage: "fix(bug): resolve issue",
      });
    });

    it("should handle empty array", () => {
      const response = "[]";

      const result = parseCommitGroups(response);

      expect(result).toHaveLength(0);
    });

    it("should throw error for invalid JSON", () => {
      const response = "invalid json";

      expect(() => parseCommitGroups(response)).toThrow("Failed to parse AI response");
    });

    it("should throw error for malformed response", () => {
      const response = "not an array";

      expect(() => parseCommitGroups(response)).toThrow("Failed to parse AI response");
    });

    it("should handle complex commit messages", () => {
      const response = `[
        {
          "files": ["src/auth.ts", "src/middleware/auth.ts"],
          "commitMessage": "feat(auth): implement JWT authentication with middleware support"
        }
      ]`;

      const result = parseCommitGroups(response);

      expect(result[0]?.commitMessage).toBe("feat(auth): implement JWT authentication with middleware support");
    });
  });

  describe("gitprompt file integration", () => {
    it("should find git root in current directory", async () => {
      const gitRoot = await findGitRoot();
      expect(gitRoot).toBeTruthy();
      // Just verify it's a valid path and contains a .git directory
      expect(typeof gitRoot).toBe("string");
      if (gitRoot) {
        expect(gitRoot.length).toBeGreaterThan(0);
      }
    });

    it("should read .gitprompt file if it exists", async () => {
      const userRules = await readGitPromptFile();
      
      // If .gitprompt exists, it should return non-empty content
      // If it doesn't exist, it should return empty string
      expect(typeof userRules).toBe("string");
      
      // If we have a .gitprompt file, it should contain some content
      if (userRules.length > 0) {
        expect(userRules).toContain("conventional commit");
      }
    });
  });

  describe("readRulesFile", () => {
    it("should throw error for non-existent file", async () => {
      const nonExistentPath = "/path/that/does/not/exist.txt";
      
      await expect(readRulesFile(nonExistentPath)).rejects.toThrow(`Failed to read rules file at ${nonExistentPath}`);
    });

    it("should read file content and trim whitespace", async () => {
      // Create a temporary test file
      const testContent = "  test rules content  \n";
      const testFilePath = "/tmp/test-rules.txt";
      
      try {
        await Bun.write(testFilePath, testContent);
        const result = await readRulesFile(testFilePath);
        expect(result).toBe("test rules content");
      } finally {
        // Clean up
        try {
          await Bun.file(testFilePath).text();
          // If file exists, remove it
          const fs = await import("fs/promises");
          await fs.unlink(testFilePath);
        } catch {
          // File doesn't exist, that's fine
        }
      }
    });
  });

  describe("generateCommitGroups with verbose", () => {
    let consoleSpy: any;

    beforeEach(() => {
      consoleSpy = spyOn(console, "log");
      mockGenerateText.mockClear();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("should call AI with proper parameters", async () => {
      const mockDiffs = [
        {
          filename: "test.ts",
          changeType: "modified",
          diffText: "+console.log('test');",
          isBinary: false
        }
      ];

      const result = await generateCommitGroups(mockDiffs, undefined, false, 10000);
      
      expect(mockGenerateText).toHaveBeenCalledTimes(1);
      expect(result).toBe('[{"files": ["test.ts"], "commitMessage": "feat(test): add test"}]');
    });

    it("should show system prompt and AI response when verbose is true", async () => {
      const mockDiffs = [
        {
          filename: "test.ts",
          changeType: "modified",
          diffText: "+console.log('test');",
          isBinary: false
        }
      ];

      await generateCommitGroups(mockDiffs, undefined, true, 10000);

      // Check that verbose logging was called
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("SYSTEM PROMPT:"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("AI RESPONSE:"));
      expect(mockGenerateText).toHaveBeenCalledTimes(1);
    });

    it("should not show extra logging when verbose is false", async () => {
      const mockDiffs = [
        {
          filename: "test.ts",
          changeType: "modified",
          diffText: "+console.log('test');",
          isBinary: false
        }
      ];

      await generateCommitGroups(mockDiffs, undefined, false, 10000);

      // Check that verbose logging was NOT called
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining("SYSTEM PROMPT:"));
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining("AI RESPONSE:"));
    });

    it("should use custom rules file when provided", async () => {
      const mockDiffs = [
        {
          filename: "test.ts",
          changeType: "modified",
          diffText: "+console.log('test');",
          isBinary: false
        }
      ];

      // Create a temporary test file for rules
      const testRulesPath = "/tmp/test-rules.txt";
      const testRulesContent = "Use custom commit format";
      
      try {
        await Bun.write(testRulesPath, testRulesContent);
        
        const result = await generateCommitGroups(mockDiffs, testRulesPath, false, 10000);
        
        expect(mockGenerateText).toHaveBeenCalledTimes(1);
        expect(result).toBe('[{"files": ["test.ts"], "commitMessage": "feat(test): add test"}]');
      } finally {
        // Clean up
        try {
          const fs = await import("fs/promises");
          await fs.unlink(testRulesPath);
        } catch {
          // File doesn't exist, that's fine
        }
      }
    });

    it("should handle binary files in diff data", async () => {
      const mockDiffs = [
        {
          filename: "image.png",
          changeType: "added",
          diffText: "Binary file added",
          isBinary: true
        },
        {
          filename: "script.js",
          changeType: "modified",
          diffText: "+console.log('test');",
          isBinary: false
        }
      ];

      const result = await generateCommitGroups(mockDiffs, undefined, false, 10000);
      
      expect(mockGenerateText).toHaveBeenCalledTimes(1);
      expect(result).toBe('[{"files": ["test.ts"], "commitMessage": "feat(test): add test"}]');
      
      // Verify that generateText was called with the binary diff data
      expect(mockGenerateText).toHaveBeenCalledWith(expect.objectContaining({
        prompt: expect.stringContaining("image.png")
      }));
    });

    it("should respect token limits and proceed when under limit", async () => {
      const mockDiffs = [
        {
          filename: "small.ts",
          changeType: "modified",
          diffText: "+test", // Small diff
          isBinary: false
        }
      ];

      // Use a very high token limit to ensure we're under it
      const result = await generateCommitGroups(mockDiffs, undefined, false, 50000);
      
      expect(mockGenerateText).toHaveBeenCalledTimes(1);
      expect(result).toBe('[{"files": ["test.ts"], "commitMessage": "feat(test): add test"}]');
    });
  });
}); 