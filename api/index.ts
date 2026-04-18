import express from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let isRoutesRegistered = false;

// Native Vercel Handler
export default async function handler(req: any, res: any) {
  try {
    if (!isRoutesRegistered) {
      console.log("[Vercel] Registering server routes (Static Import Path)...");
      const httpServer = createServer(app);
      await registerRoutes(httpServer, app);
      isRoutesRegistered = true;
    }
    
    // Pass control to Express
    return app(req, res);
    
  } catch (err: any) {
    console.error("[Vercel] RUNTIME ERROR:", err);
    res.setHeader("Content-Type", "application/json");
    // Return detailed error only if headers not sent
    if (!res.headersSent) {
      return res.status(500).json({
        message: "Taskling encountered a runtime error.",
        error: err.message || String(err),
        stack: err.stack
      });
    }
  }
}
