import type { WorkflowStepAction, WorkflowStepSource } from "./record.contract.js";

export type ExecutionStatus =
  | "RUNNING"
  | "PASSED"
  | "FAILED"
  | "CANCELED"
  | "TIMED_OUT";

export type ExecutionStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export interface ExecutionStepRequest {
  stepId: string;
  orderIndex: number;
  action: WorkflowStepAction;
  source: WorkflowStepSource;
  selector: string | null;
  value: string | null;
  expectedValue: string | null;
  meta: Record<string, unknown>;
  optional: boolean;
  timeoutMs: number | null;
  retryCount: number;
}

export interface ExecutionStartRequest {
  executionId: string;
  workflowId: string;
  workflowVersionId: string;
  versionNumber: number;
  workflowName: string;
  workflowDescription: string | null;
  environmentName: string;
  webBaseUrl: string;
  apiBaseUrl: string | null;
  steps: ExecutionStepRequest[];
}

export interface ExecutionStepRunResponse {
  stepId: string;
  orderIndex: number;
  status: ExecutionStepStatus;
  errorMessage: string | null;
  screenshotUrl: string | null;
  log: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
}

export interface ExecutionRunResponse {
  status: ExecutionStatus;
  startedAt: string;
  finishedAt: string;
  errorMessage: string | null;
  log: string | null;
  stepResults: ExecutionStepRunResponse[];
}
