import { Router, Request, Response } from "express";
import { requireExecutionSecret } from "../execution-secret.middleware.js";
import { runExecution } from "../execution-runner.js";
import { ExecutionStartRequestSchema } from "../execution.validation.js";
import type {
  ExecutionRunResponse,
  ExecutionStartRequest,
} from "../contracts/execution.contract.js";

const router = Router();

router.post(
  "/start",
  requireExecutionSecret,
  async (
    req: Request<{}, ExecutionRunResponse | { error: string }, ExecutionStartRequest>,
    res: Response<ExecutionRunResponse | { error: string }>
  ) => {
    const parsed = ExecutionStartRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; "),
      });
    }

    try {
      const result = await runExecution(parsed.data);
      return res.status(200).json(result);
    } catch (error) {
      const now = new Date().toISOString();
      const errorMessage = error instanceof Error ? error.message : String(error);

      return res.status(200).json({
        status: "FAILED",
        startedAt: now,
        finishedAt: now,
        errorMessage,
        log: errorMessage,
        stepResults: [],
      });
    }
  }
);

export default router;
