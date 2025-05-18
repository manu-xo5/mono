import { db } from "../index.ts";
import { messageTable, roomTable } from "../schema/message.ts";

type Values = Pick<
  typeof messageTable.$inferInsert,
  "from" | "to" | "body" | "type" | "id" | "updatedAt"
>;
export async function storeMessage(roomId: string, values: Values) {
  await db
    .insert(roomTable)
    .values({
      roomId,
      user1: values.from,
      user2: values.to,
    })
    .onConflictDoNothing();

  const [message] = await db
    .insert(messageTable)
    .values({
      id: values.id,
      from: values.from,
      roomId: roomId,
      to: values.to,
      type: values.type,
      body: values.body,
      updatedAt: values.updatedAt,
    })
    .returning();

  console.log({ message });
  return message;
}
