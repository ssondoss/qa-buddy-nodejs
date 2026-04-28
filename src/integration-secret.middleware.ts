import { NextFunction, Request, Response } from "express";
import { config } from "./config.js";

export const requireIntegrationSecret = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.get(config.integrationSecretHeader) !== config.integrationSecret) {
    return res.status(401).json({ error: "Invalid integration secret" });
  }

  next();
};
