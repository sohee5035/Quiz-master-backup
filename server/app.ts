import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { logEnvironmentStatus } from "./environment";

// Shared Express app setup used by both the long-running local/Replit
// server (server/index.ts) and the Vercel serverless entry (api/index.ts).
export async function createApp() {
  const app = express();

  // Trust proxy to get real IP addresses in production
  app.set("trust proxy", true);

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        console.log(logLine);
      }
    });

    next();
  });

  // Perform comprehensive environment validation
  const envValidation = await logEnvironmentStatus();

  // In production, fail fast only if there are actual errors (not warnings)
  if (process.env.NODE_ENV === "production" && !envValidation.isValid) {
    console.error("\n💥 Deployment cannot start due to configuration errors");
    console.error("Please fix the above issues and redeploy");
    throw new Error("Invalid environment configuration");
  }

  const httpServer = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  return { app, httpServer };
}
