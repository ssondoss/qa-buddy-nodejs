import { config } from "./config.js";
export const requireIntegrationSecret = (req, res, next) => {
    if (req.get(config.integrationSecretHeader) !== config.integrationSecret) {
        return res.status(401).json({ error: "Invalid integration secret" });
    }
    next();
};
