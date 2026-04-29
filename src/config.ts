const DEFAULT_INTEGRATION_SECRET = "qa-buddy-recording-shared-secret";

export const config = {
  integrationSecret:
    process.env.RECORDING_INTEGRATION_SECRET ??
    process.env.RECORDING_SHARED_SECRET ??
    DEFAULT_INTEGRATION_SECRET,
  integrationSecretHeader: "X-Integration-Secret",
  recordingsDir: process.env.RECORDINGS_DIR ?? "src/recordings",
  springBaseUrl: process.env.SPRING_BASE_URL ?? "http://localhost:8080",
  recordingCompletePath:
    process.env.RECORDING_COMPLETE_PATH ??
    "/api/version/recording/complete/{workflowVersionId}",
  port: Number(process.env.PORT ?? 3000),
};
