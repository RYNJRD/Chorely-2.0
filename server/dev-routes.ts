import { Express } from "express";
import { notifyUser } from "./services/notification-service.js";
import { triggerWeeklyReports } from "./services/weekly-report-service.js";

// In-memory mock states for DEV MODE
export const devState = {
  isPremium: false,
  trialExpiresAt: new Date(Date.now() + 2 * 60_000), // 2 mins trial
};

export function registerDevRoutes(app: Express) {
  const DEV_MODE = process.env.NODE_ENV !== "production";
  
  if (!DEV_MODE) return;

  console.log("[DEV] Registering Development Routes");

  app.post("/api/dev/trigger-weekly-report", async (req, res) => {
    console.log("[DEV] Triggering weekly reports...");
    await triggerWeeklyReports();
    res.json({ success: true, message: "Weekly report triggered" });
  });

  app.post("/api/dev/send-test-email", async (req, res) => {
    const { type, email } = req.body;
    console.log(`[DEV] Sending test email (${type}) to ${email || "default"}...`);
    
    await notifyUser({
      email: email || "test@example.com",
      type: type || "WEEKLY_REPORT_READY",
      channels: ["email"],
      payload: { 
        code: "123456", 
        actionLink: "http://localhost:5000/verify",
        childrenStats: [
          { name: "TestChild", choresCompleted: 5, starsEarned: 20 }
        ]
      }
    });
    res.json({ success: true, message: "Test email sent" });
  });

  app.post("/api/dev/expire-trial", (req, res) => {
    console.log("[DEV] Forcing trial to expire immediately...");
    devState.trialExpiresAt = new Date(Date.now() - 1000);
    devState.isPremium = false;
    res.json({ success: true, message: "Trial expired" });
  });

  app.post("/api/dev/set-premium", (req, res) => {
    const { isPremium, daysLeft } = req.body;
    console.log(`[DEV] Setting premium: ${isPremium}, days left: ${daysLeft}`);
    devState.isPremium = isPremium;
    if (isPremium) {
      devState.trialExpiresAt = new Date(Date.now() + (daysLeft || 7) * 24 * 60 * 60 * 1000);
    }
    res.json({ success: true, devState });
  });

  app.post("/api/dev/test-notification", async (req, res) => {
    const { type, channels } = req.body;
    console.log(`[DEV] Testing notification (${type}) via [${channels.join(", ")}]...`);
    await notifyUser({
      email: "test@example.com",
      type: type || "WEEKLY_REPORT_READY",
      channels: channels || ["inApp", "push"],
      payload: { code: "654321", actionLink: "http://localhost:5000/reset" }
    });
    res.json({ success: true, message: "Notification tested" });
  });

  app.post("/api/dev/generate-otp", (req, res) => {
    const rawCode = String(Math.floor(100000 + Math.random() * 900000));
    console.log(`[DEV OTP GENERATOR] Raw Code Generated: ${rawCode}`);
    // Note: this just logs to console, it doesn't store in DB. Real route does that.
    res.json({ success: true, code: rawCode, message: "Logged to server console" });
  });
}
