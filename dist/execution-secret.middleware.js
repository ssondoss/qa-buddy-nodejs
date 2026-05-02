import { config } from "./config.js";
export const requireExecutionSecret = (req, res, next) => {
    if (req.get(config.integrationSecretHeader) !== config.executionSecret) {
        return res.status(401).json({ error: "Invalid execution secret" });
    }
    next();
};
