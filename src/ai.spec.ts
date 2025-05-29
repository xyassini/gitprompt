import { describe, it, expect } from "bun:test";
import { parseCommitGroups } from "./ai";

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
}); 