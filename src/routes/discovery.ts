import { Router, Request, Response } from "express";
import { requireExecutionSecret } from "../execution-secret.middleware.js";
import { runDiscovery } from "../discovery-runner.js";
import { DiscoveryStartRequestSchema } from "../discovery.validation.js";
import type {
  DiscoveryRunResponse,
  DiscoveryStartRequest,
} from "../contracts/discovery.contract.js";

const router = Router();

router.post(
  "/start",
  requireExecutionSecret,
  async (
    req: Request<{}, DiscoveryRunResponse | { error: string }, DiscoveryStartRequest>,
    res: Response<DiscoveryRunResponse | { error: string }>
  ) => {
    const parsed = DiscoveryStartRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; "),
      });
    }

    try {
      const result = await runDiscovery(parsed.data);
      return res.status(200).json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ error: errorMessage });
    }
  }
);

export default router;