import { messages } from "../../shared/schema.js";
import { db } from "../db.js";
import { publishFamilyEvent } from "../realtime.js";
import { recordActivity } from "./activity-service.js";

type CreateMessageArgs = {
  familyId: number;
  userId: number;
  senderName: string;
  content: string;
  isSystem?: boolean;
};

export async function createMessage(args: CreateMessageArgs) {
  const [message] = await db.insert(messages).values(args).returning();
  publishFamilyEvent(args.familyId, "family:message", message);
  if (!args.isSystem) {
    await recordActivity({
      familyId: args.familyId,
      userId: args.userId,
      type: "chat_message",
      title: `${args.senderName} sent a message`,
      body: args.content.startsWith("[IMAGE:]") ? "📷 Photo" : args.content.slice(0, 100),
      relatedEntityType: "message",
      relatedEntityId: message.id,
    });
  }
  return message;
}

export async function createSystemMessage(familyId: number, userId: number, content: string) {
  return createMessage({
    familyId,
    userId,
    senderName: "Taskling",
    content,
    isSystem: true,
  });
}
