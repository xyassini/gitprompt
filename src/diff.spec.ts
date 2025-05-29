import { describe, it, expect } from "bun:test";
import { calculateLineDiffs } from "./diff";

describe("diff", () => {
  describe("calculateLineDiffs", () => {
    it("should detect added lines", () => {
      const staged = "line 1\nline 2";
      const workdir = "line 1\nline 2\nline 3";

      const result = calculateLineDiffs(staged, workdir);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        lineNumber: 3,
        type: "added",
        newContent: "line 3",
      });
    });

    it("should detect removed lines", () => {
      const staged = "line 1\nline 2\nline 3";
      const workdir = "line 1\nline 2";

      const result = calculateLineDiffs(staged, workdir);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        lineNumber: 3,
        type: "removed",
        oldContent: "line 3",
      });
    });

    it("should detect modified lines", () => {
      const staged = "line 1\noriginal line\nline 3";
      const workdir = "line 1\nmodified line\nline 3";

      const result = calculateLineDiffs(staged, workdir);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        lineNumber: 2,
        type: "modified",
        oldContent: "original line",
        newContent: "modified line",
      });
    });

    it("should handle empty files", () => {
      const staged = "";
      const workdir = "";

      const result = calculateLineDiffs(staged, workdir);

      expect(result).toHaveLength(0);
    });

    it("should handle new file (empty staged)", () => {
      const staged = "";
      const workdir = "new line 1\nnew line 2";

      const result = calculateLineDiffs(staged, workdir);

      expect(result).toHaveLength(2);
      expect(result[0]?.type).toBe("added");
      expect(result[1]?.type).toBe("added");
    });

    it("should handle deleted file (empty workdir)", () => {
      const staged = "deleted line 1\ndeleted line 2";
      const workdir = "";

      const result = calculateLineDiffs(staged, workdir);

      expect(result).toHaveLength(2);
      expect(result[0]?.type).toBe("removed");
      expect(result[1]?.type).toBe("removed");
    });

    it("should handle complex changes", () => {
      const staged = "line 1\nline 2\nline 3";
      const workdir = "modified line 1\nline 2\nline 4\nline 5";

      const result = calculateLineDiffs(staged, workdir);

      expect(result).toHaveLength(3);
      expect(result[0]?.type).toBe("modified");
      expect(result[0]?.lineNumber).toBe(1);
      expect(result[1]?.type).toBe("modified");
      expect(result[1]?.lineNumber).toBe(3);
      expect(result[2]?.type).toBe("added");
      expect(result[2]?.lineNumber).toBe(4);
    });

    it("should handle single character changes", () => {
      const staged = "hello world";
      const workdir = "hello there";

      const result = calculateLineDiffs(staged, workdir);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        lineNumber: 1,
        type: "modified",
        oldContent: "hello world",
        newContent: "hello there",
      });
    });

    it("should handle multiple line modifications", () => {
      const staged = "a\nb\nc\nd";
      const workdir = "A\nB\nc\nD";

      const result = calculateLineDiffs(staged, workdir);

      expect(result).toHaveLength(3);
      expect(result[0]?.lineNumber).toBe(1);
      expect(result[1]?.lineNumber).toBe(2);
      expect(result[2]?.lineNumber).toBe(4);
    });
  });
}); 