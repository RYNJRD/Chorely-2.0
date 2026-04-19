import { activityEvents } from "../../shared/schema.js";
import type { ActivityEventType } from "../../shared/constants.js";
import { db } from "../db.js";
import { publishFamilyEvent } from "../realtime.js";

type RecordActivityArgs = {
  familyId: number;
  userId?: number | null;
  type: ActivityEventType;
  title: string;
  body: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  metadata?: Record<string, unknown>;
};

export async function recordActivity(args: RecordActivityArgs) {
  const [event] = await db
    .insert(activityEvents)
    .values({
      familyId: args.familyId,
      userId: args.userId ?? null,
      type: args.type,
      title: args.title,
      body: args.body,
      relatedEntityType: args.relatedEntityType,
      relatedEntityId: args.relatedEntityId,
      metadata: args.metadata ?? {},
    })
    .returning();

  publishFamilyEvent(args.familyId, "family:activity", event);
  return event;
}
