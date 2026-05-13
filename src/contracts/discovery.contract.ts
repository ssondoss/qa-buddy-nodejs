import type { WorkflowStepAction, WorkflowStepSource } from "./record.contract.js";

export interface DiscoveryStepRequest {
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

export interface DiscoveryStartRequest {
  versionId: string;
  webBaseUrl: string;
  apiBaseUrl: string | null;
  steps: DiscoveryStepRequest[];
}

export interface DiscoveredApiEntry {
  url: string;
  method: string;
  requestBody: string | null;
  responseStatus: number | null;
  responseBody: string | null;
}

export interface DiscoveryStepResult {
  stepId: string;
  apis: DiscoveredApiEntry[];
}

export interface DiscoveryRunResponse {
  stepResults: DiscoveryStepResult[];
}