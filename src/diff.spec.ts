import { describe, it, expect } from "bun:test";
import { generateUnifiedDiff } from "./diff";

describe("diff", () => {
  describe("generateUnifiedDiff", () => {
    it("should detect added lines", () => {
      const staged = "line 1\nline 2";
      const workdir = "line 1\nline 2\nline 3";

      const result = generateUnifiedDiff(staged, workdir);

      expect(result).toBe(" line 1\n line 2\n+line 3");
    });

    it("should detect removed lines", () => {
      const staged = "line 1\nline 2\nline 3";
      const workdir = "line 1\nline 2";

      const result = generateUnifiedDiff(staged, workdir);

      expect(result).toBe(" line 1\n line 2\n-line 3");
    });

    it("should detect modified lines", () => {
      const staged = "line 1\noriginal line\nline 3";
      const workdir = "line 1\nmodified line\nline 3";

      const result = generateUnifiedDiff(staged, workdir);

      expect(result).toBe(" line 1\n-original line\n+modified line\n line 3");
    });

    it("should handle empty files", () => {
      const staged = "";
      const workdir = "";

      const result = generateUnifiedDiff(staged, workdir);

      expect(result).toBe("");
    });

    it("should handle new file (empty staged)", () => {
      const staged = "";
      const workdir = "new line 1\nnew line 2";

      const result = generateUnifiedDiff(staged, workdir);

      expect(result).toBe("+new line 1\n+new line 2");
    });

    it("should handle deleted file (empty workdir)", () => {
      const staged = "deleted line 1\ndeleted line 2";
      const workdir = "";

      const result = generateUnifiedDiff(staged, workdir);

      expect(result).toBe("-deleted line 1\n-deleted line 2");
    });

    it("should handle complex changes", () => {
      const staged = "line 1\nline 2\nline 3";
      const workdir = "modified line 1\nline 2\nline 4\nline 5";

      const result = generateUnifiedDiff(staged, workdir);

      expect(result).toBe("-line 1\n+modified line 1\n line 2\n-line 3\n+line 4\n+line 5");
    });

    it("should handle single character changes", () => {
      const staged = "hello world";
      const workdir = "hello there";

      const result = generateUnifiedDiff(staged, workdir);

      expect(result).toBe("-hello world\n+hello there");
    });

    it("should handle multiple line modifications", () => {
      const staged = "a\nb\nc\nd";
      const workdir = "A\nB\nc\nD";

      const result = generateUnifiedDiff(staged, workdir);

      expect(result).toBe("-a\n+A\n-b\n+B\n c\n-d\n+D");
    });
  });
}); 