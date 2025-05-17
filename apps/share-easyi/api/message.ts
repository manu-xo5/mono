import { Context } from "hono";
import { db } from "../db/index.ts";
import { eq } from "drizzle-orm";
import { messageTable } from "../db/schema/message.ts";

export async function GET(c: Context): Promise<Response> {
  const roomId = c.req.query("roomId");
  if (!roomId) return c.json({ fail: "roomId is required" }, 400);

  const messages = await db.query.messageTable.findMany({
    where: eq(messageTable.roomId, roomId ?? ""),
  });

  console.log(messages);
  return c.json({ ok: messages });
}
