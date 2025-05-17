import { Context } from "hono";
import { db } from "../db/index.ts";
import { roomTable } from "../db/schema/message.ts";
import { eq, ilike, or } from "drizzle-orm";

export async function GET(c: Context) {
  const user = c.get("user");
  if (!user || !user.id) return c.json({ fail: "user_id is required" }, 400);

  const rooms = await db.query.roomTable.findMany({
    where: or(eq(roomTable.user1, user.id), eq(roomTable.user2, user.id)),
  });

  return c.json({ ok: rooms });
}
