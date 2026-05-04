import { db } from "../server/db";
import { families } from "../shared/schema";
import { eq, isNull } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function migrate() {
  console.log("Updating all families to 14-day trial status starting now...");
  const trialEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  
  const result = await db.update(families)
    .set({
      subscriptionStatus: "trialing",
      trialEndsAt: trialEnds
    });
    
  console.log("Done!");
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
