export interface IndexCheckOptions {
  path: string;
  extensions: string[];
  autoFix: boolean;
  excludePatterns: string[];
  verbose: boolean;
}

export type IssueKind = "MISSING_INDEX" | "MISSING_EXPORT" | "STALE_EXPORT" | "CIRCULAR_SUSPECTED";

export interface IndexIssue {
  kind: IssueKind;
  directory: string;
  file?: string;
  message: string;
  fixable: boolean;
}

export interface IndexCheckResult {
  checkedAt: string;
  rootPath: string;
  directoriesScanned: number;
  issues: IndexIssue[];
  autoFixed: string[];
  summary: {
    missingIndex: number;
    missingExport: number;
    staleExport: number;
    totalIssues: number;
  };
}
