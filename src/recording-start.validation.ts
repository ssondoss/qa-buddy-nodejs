import type { RecordingStartRequest } from "./contracts/record.contract.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isUuid = (value: unknown): value is string =>
  isNonEmptyString(value) && UUID_PATTERN.test(value);

const isNullableString = (value: unknown): value is string | null =>
  value === null || value === undefined || typeof value === "string";

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const parseRecordingStartRequest = (
  body: unknown
): { value?: RecordingStartRequest; errors: string[] } => {
  const errors: string[] = [];

  if (!body || typeof body !== "object") {
    return { errors: ["Request body must be a JSON object"] };
  }

  const candidate = body as Partial<RecordingStartRequest>;

  if (!isUuid(candidate.workflowId)) {
    errors.push("workflowId must be a UUID");
  }

  if (!isUuid(candidate.workflowVersionId)) {
    errors.push("workflowVersionId must be a UUID");
  }

  if (
    typeof candidate.versionNumber !== "number" ||
    !Number.isInteger(candidate.versionNumber) ||
    candidate.versionNumber < 1
  ) {
    errors.push("versionNumber must be a positive integer");
  }

  if (!isNonEmptyString(candidate.workflowName)) {
    errors.push("workflowName is required");
  }

  if (!isNullableString(candidate.workflowDescription)) {
    errors.push("workflowDescription must be a string or null");
  }

  if (!isNonEmptyString(candidate.webBaseUrl) || !isValidUrl(candidate.webBaseUrl)) {
    errors.push("webBaseUrl must be a valid URL");
  }

  if (!isNonEmptyString(candidate.apiBaseUrl) || !isValidUrl(candidate.apiBaseUrl)) {
    errors.push("apiBaseUrl must be a valid URL");
  }

  if (!isNullableString(candidate.startPath)) {
    errors.push("startPath must be a string or null");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors,
    value: {
      workflowId: candidate.workflowId!.trim(),
      workflowVersionId: candidate.workflowVersionId!.trim(),
      versionNumber: candidate.versionNumber!,
      workflowName: candidate.workflowName!.trim(),
      workflowDescription: candidate.workflowDescription?.trim() || null,
      webBaseUrl: candidate.webBaseUrl!.trim(),
      apiBaseUrl: candidate.apiBaseUrl!.trim(),
      startPath: candidate.startPath?.trim() || null,
    },
  };
};
