import { sendOtpEmail, sendPasswordResetEmail, sendWeeklySummaryEmail } from "./email-service.js";
import { getAuth } from "firebase-admin/auth";
import { db } from "../db.js";
import { users } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

type NotificationType = "WEEKLY_REPORT_READY" | "PASSWORD_RESET" | "EMAIL_VERIFICATION";
type NotificationChannel = "push" | "email" | "inApp";

interface NotifyUserOptions {
  userId?: number;
  firebaseUid?: string;
  email?: string;
  type: NotificationType;
  channels: NotificationChannel[];
  payload?: any;
}

export async function notifyUser(options: NotifyUserOptions) {
  let targetEmail = options.email;
  let targetName = "Taskling User";

  // Try to resolve email/name if not provided directly
  if (!targetEmail && options.userId) {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, options.userId)
    });
    if (userRecord) {
      targetName = userRecord.username;
      if (userRecord.firebaseUid) {
        try {
          const fbUser = await getAuth().getUser(userRecord.firebaseUid);
          targetEmail = fbUser.email;
        } catch (e) {
          console.error("Failed to get firebase user email", e);
        }
      }
    }
  }

  if (options.channels.includes("email") && targetEmail) {
    switch (options.type) {
      case "EMAIL_VERIFICATION":
        await sendOtpEmail(targetEmail, options.payload.code, options.payload.actionLink);
        break;
      case "PASSWORD_RESET":
        await sendPasswordResetEmail(targetEmail, options.payload.code, options.payload.actionLink);
        break;
      case "WEEKLY_REPORT_READY":
        // For now, redirecting to the existing weekly summary
        await sendWeeklySummaryEmail(targetEmail, targetName, options.payload.childrenStats || []);
        break;
    }
  }

  if (options.channels.includes("push")) {
    // Placeholder push notification system
    console.log(`[Push Notification] Sent to user ${options.userId || options.email} for ${options.type}`);
  }

  if (options.channels.includes("inApp")) {
    // Placeholder in-app notification storage
    console.log(`[In-App Notification] Stored for user ${options.userId || options.email} for ${options.type}`);
  }
}
