import type { StageStatus, HeadStatus, StatusRow, WorkdirStatus } from "isomorphic-git";

export type StatusMatrix = StatusRow[];

export interface LineDiff {
  lineNumber: number;
  type: 'added' | 'removed' | 'modified';
  oldContent?: string;
  newContent?: string;
}

export interface Diff {
  filename: string;
  changeType: string;
  staged: string;
  workdir: string;
  statusMatrix: [HeadStatus, WorkdirStatus, StageStatus];
  lineChanges: LineDiff[];
}
