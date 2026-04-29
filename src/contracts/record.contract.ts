export type RecordingPhase = 'idle' | 'recording';

export interface RecordingStatus {
  phase: RecordingPhase;
  hasResult: boolean;
}

export interface RecordingStartRequest {
  workflowId: string;
  workflowVersionId: string;
  versionNumber: number;
  workflowName: string;
  workflowDescription: string | null;
  webBaseUrl: string;
  apiBaseUrl: string;
  startPath: string | null;
}

export interface RecordingStartResponse extends RecordingStatus {
  workflowId: string;
  workflowVersionId: string;
  versionNumber: number;
  workflowName: string;
  file: string;
}

export type WorkflowStepAction =
  | 'CLICK'
  | 'FILL'
  | 'NAVIGATE'
  | 'WAIT'
  | 'ASSERT_TEXT'
  | 'ASSERT_API';

export type WorkflowStepSource = 'RECORDED' | 'MANUAL' | 'MIXED';

export type WorkflowVersionStatus =
  | 'DRAFT'
  | 'RECORDING'
  | 'READY'
  | 'FAILED';

export interface WorkflowStepRequest {
  action: WorkflowStepAction;
  source?: WorkflowStepSource;
  selector?: string;
  value?: string;
  expectedValue?: string;
  meta?: Record<string, unknown>;
  optional?: boolean;
  timeoutMs?: number;
  retryCount?: number;
}

export interface RecordingCompleteRequest {
  status: WorkflowVersionStatus;
  steps: WorkflowStepRequest[];
}
