import { spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import { config } from "./config.js";
import { parseRecordingSteps } from "./recording-parser.js";
import type {
  RecordingPhase,
  RecordingStartRequest,
  RecordingStartResponse,
  WorkflowVersionCompleteRequest,
} from "./contracts/record.contract.js";

let phase: RecordingPhase = "idle";
let codegenProcess: ChildProcess | null = null;

export const isRecording = () => phase === "recording";

export const startRecording = (
  recording: RecordingStartRequest
): RecordingStartResponse => {
  const outputFile = createOutputFile(recording);

  phase = "recording";
  codegenProcess = spawn("npx", buildCodegenArgs(outputFile, recording), {
    stdio: "inherit",
    shell: true,
  });

  let completionHandled = false;

  const completeOnce = (request: WorkflowVersionCompleteRequest) => {
    if (completionHandled) {
      return;
    }

    completionHandled = true;
    phase = "idle";
    codegenProcess = null;
    void notifySpringRecordingComplete(recording, request);
  };

  codegenProcess.on("error", (error) => {
    console.error("[record] failed to start Playwright codegen:", error);
    completeOnce({ status: "FAILED", steps: [] });
  });

  codegenProcess.on("close", () => {
    setTimeout(() => {
      try {
        if (!fs.existsSync(outputFile)) {
          console.log("[record] file missing:", outputFile);
          completeOnce({ status: "FAILED", steps: [] });
          return;
        }

        const content = fs.readFileSync(outputFile, "utf-8");
        const steps = parseRecordingSteps(content);

        console.log("[record] file read, parsed steps:", steps.length);
        completeOnce({ status: "READY", steps });
      } catch (error) {
        console.error("[record] failed to read or parse recording file:", error);
        completeOnce({ status: "FAILED", steps: [] });
      }
    }, 500);
  });

  return {
    phase: "recording",
    hasResult: false,
    workflowId: recording.workflowId,
    workflowVersionId: recording.workflowVersionId,
    versionNumber: recording.versionNumber,
    workflowName: recording.workflowName,
    file: outputFile,
  };
};

const createOutputFile = (recording: RecordingStartRequest) => {
  fs.mkdirSync(config.recordingsDir, { recursive: true });

  const workflowId = sanitizeFileSegment(recording.workflowId);
  const workflowVersionId = sanitizeFileSegment(recording.workflowVersionId);

  return path.join(
    config.recordingsDir,
    `workflow-${workflowId}-version-${workflowVersionId}-v${recording.versionNumber}-${Date.now()}.ts`
  );
};

const buildCodegenArgs = (
  outputFile: string,
  recording: RecordingStartRequest
) => {
  const args = ["playwright", "codegen", "--output", outputFile];
  args.push(buildRecordingStartUrl(recording));

  return args;
};

const buildRecordingStartUrl = (recording: RecordingStartRequest) =>
  new URL(recording.startPath ?? "", recording.webBaseUrl).toString();

const notifySpringRecordingComplete = async (
  recording: RecordingStartRequest,
  request: WorkflowVersionCompleteRequest
) => {
  try {
    const response = await fetch(buildCompleteUrl(recording.workflowVersionId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [config.integrationSecretHeader]: config.integrationSecret,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Spring completion callback failed with ${response.status}: ${body}`
      );
    }

    console.log(
      `[record] notified Spring that workflow version ${recording.workflowVersionId} completed`
    );
  } catch (error) {
    console.error("[record] failed to notify Spring completion endpoint:", error);
  }
};

const buildCompleteUrl = (workflowVersionId: string) => {
  const encodedWorkflowVersionId = encodeURIComponent(workflowVersionId);
  const callbackPath = config.recordingCompletePath
    .replace(":workflowVersionId", encodedWorkflowVersionId)
    .replace("{workflowVersionId}", encodedWorkflowVersionId);

  return new URL(callbackPath, config.springBaseUrl).toString();
};

const sanitizeFileSegment = (value: string) =>
  value.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").slice(0, 80);
