import { NextFunction, Request, Response } from "express";
import { config } from "./config.js";

export const requireExecutionSecret = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.get(config.integrationSecretHeader) !== config.executionSecret) {
    return res.status(401).json({ error: "Invalid execution secret" });
  }

  next();
};
