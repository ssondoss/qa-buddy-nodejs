import { Router } from "express";
import { requireExecutionSecret } from "../execution-secret.middleware.js";
import { runExecution } from "../execution-runner.js";
import { ExecutionStartRequestSchema } from "../execution.validation.js";
const router = Router();
router.post("/start", requireExecutionSecret, async (req, res) => {
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
        console.log("[execution] result:", JSON.stringify(result, null, 2));
        return res.status(200).json(result);
    }
    catch (error) {
        const now = new Date().toISOString();
        const errorMessage = error instanceof Error ? error.message : String(error);
        const result = {
            status: "FAILED",
            startedAt: now,
            finishedAt: now,
            errorMessage,
            log: errorMessage,
            stepResults: [],
        };
        console.log("[execution] result:", JSON.stringify(result, null, 2));
        return res.status(200).json(result);
    }
});
export default router;
