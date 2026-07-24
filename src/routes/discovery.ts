import { Router, Request, Response } from "express";
import { requireExecutionSecret } from "../execution-secret.middleware.js";
import { runDiscovery } from "../discovery-runner.js";
import { DiscoveryStartRequestSchema } from "../discovery.validation.js";
import type {
  DiscoveryRunResponse,
  DiscoveryStartRequest,
} from "../contracts/discovery.contract.js";
import { validate } from "../validate.middleware.js";

const router = Router();

router.post(
  "/start",
  requireExecutionSecret,
  validate(DiscoveryStartRequestSchema),

  async (
    req: Request<
      {},
      DiscoveryRunResponse | { error: string },
      DiscoveryStartRequest
    >,
    res: Response<DiscoveryRunResponse | { error: string }>,
  ) => {
      try {
      const result = await runDiscovery(req.body); 
      return res.status(200).json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ error: errorMessage });
    }
  },
);

export default router;
