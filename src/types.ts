import type { StageStatus, HeadStatus, StatusRow, WorkdirStatus } from "isomorphic-git";

export type StatusMatrix = StatusRow[];

export interface Diff {
  filename: string;
  changeType: string;
  diffText: string;
  isBinary: boolean;
}
