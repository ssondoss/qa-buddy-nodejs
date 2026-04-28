import { Router, Request, Response } from "express";
import { requireIntegrationSecret } from "../integration-secret.middleware.js";
import { isRecording, startRecording } from "../recording-runner.js";
import { parseRecordingStartRequest } from "../recording-start.validation.js";
import type {
  RecordingStartRequest,
  RecordingStartResponse,
} from "../contracts/record.contract.js";

type ErrorResponse = { error: string; details?: string[] };
type StartRecordingResponse = RecordingStartResponse | ErrorResponse;

const router = Router();

// server.ts mounts this router at /api/recordings.
// Full endpoint: POST /api/recordings/start
router.post(
  "/start",
  requireIntegrationSecret,
  (
    req: Request<{}, StartRecordingResponse, RecordingStartRequest>,
    res: Response<StartRecordingResponse>,
  ) => {
    const parsed = parseRecordingStartRequest(req.body);

    if (!parsed.value) {
      return res.status(400).json({
        error: "Invalid recording start request",
        details: parsed.errors,
      });
    }
    console.log("Received recording start request:", parsed.value);
    if (isRecording()) {
      return res.status(409).json({ error: "Already recording" });
    }

    return res.status(200).json(startRecording(parsed.value));
  },
);

export default router;
