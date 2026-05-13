const DEFAULT_INTEGRATION_SECRET = "qa-buddy-recording-shared-secret";
const DEFAULT_EXECUTION_SECRET = "qa-buddy-execution-shared-secret";

export const config = {
  integrationSecret:
    process.env.RECORDING_INTEGRATION_SECRET ??
    process.env.RECORDING_SHARED_SECRET ??
    DEFAULT_INTEGRATION_SECRET,
  executionSecret: process.env.EXECUTION_SHARED_SECRET ?? DEFAULT_EXECUTION_SECRET,
  integrationSecretHeader: "X-Integration-Secret",
  recordingsDir: process.env.RECORDINGS_DIR ?? "src/recordings",
  springBaseUrl: process.env.SPRING_BASE_URL ?? "http://localhost:8080",
  recordingCompletePath:
    process.env.RECORDING_COMPLETE_PATH ??
    "/api/version/recording/complete/{workflowVersionId}",
  executionScreenshotPath:
    process.env.EXECUTION_SCREENSHOT_PATH ??
    "/api/executions/{executionId}/screenshots",
  executionHeadless: process.env.PLAYWRIGHT_HEADLESS !== "false",
  executionSlowMo: Number(process.env.PLAYWRIGHT_SLOW_MO ?? 0),
  port: Number(process.env.PORT ?? 3000),
};
