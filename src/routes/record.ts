import { Router, Request, Response } from "express";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import type {
  RecordOpenBody,
  RecordingStatus,
  RecordResult,
} from "@qa-buddy/shared-types";

const router = Router();
const RECORDINGS_DIR = "src/recordings";

let phase: "idle" | "recording" = "idle";
let codegenProcess: ChildProcess | null = null;
let lastResult: RecordResult | null = null;

// POST /record/open — opens Playwright codegen and streams status via SSE
// Sends two events: 'recording' on start, 'idle' when QA closes the browser
router.post(
  "/open",
  (req: Request<{}, {}, RecordOpenBody>, res: Response) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    if (phase === "recording") {
      return res.status(400).json({ error: "Already recording" });
    }

    // SSE headers — keeps the connection open so we can push events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendEvent = (data: RecordingStatus) =>
      res.write(`data: ${JSON.stringify(data)}\n\n`);

    fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
    const outputFile = path.join(RECORDINGS_DIR, `recording-${Date.now()}.ts`);

    lastResult = null;
    phase = "recording";

    codegenProcess = spawn(
      "npx",
      ["playwright", "codegen", "--output", outputFile, url],
      { stdio: "inherit", shell: true }
    );

    sendEvent({ phase: "recording", hasResult: false });

    codegenProcess.on("close", () => {
      codegenProcess = null;
      phase = "idle";

      // small delay to let Playwright finish flushing the file to disk
      setTimeout(() => {
        console.log("[record] process closed, checking file:", outputFile);
        console.log("[record] file exists:", fs.existsSync(outputFile));

        if (fs.existsSync(outputFile)) {
          lastResult = {
            content: fs.readFileSync(outputFile, "utf-8"),
            file: outputFile,
          };
          console.log("[record] file read, length:", lastResult.content.length);
        }

        sendEvent({ phase: "idle", hasResult: lastResult !== null });
        res.end();
      }, 500);
    });
  }
);

// GET /record/result — returns the generated script after QA closes the browser
router.get(
  "/result",
  (_req: Request, res: Response<RecordResult | { error: string }>) => {
    if (!lastResult) {
      return res.status(404).json({ error: "No result available yet" });
    }

    res.json(lastResult);
  }
);

export default router;
