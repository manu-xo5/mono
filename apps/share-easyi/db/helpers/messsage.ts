import { eq, sql } from "drizzle-orm";
import { db } from "../index.ts";
import {
  messageOwnerTable,
  messagesPagedTable,
  messageTable,
} from "../schema/message.ts";

export async function storeMessage(
  values: typeof messageTable.$inferInsert,
  userId: string,
) {
  let head = await db
    .select()
    .from(messageOwnerTable)
    .where(eq(messageOwnerTable.userId, userId))
    .then((r) => r.at(0));

  let pagedMessages: typeof messagesPagedTable.$inferSelect;
  if (!head) {
    pagedMessages = await db
      .insert(messagesPagedTable)
      .values({})
      .returning()
      .then((r) => r[0]);

    head = await db
      .insert(messageOwnerTable)
      .values({
        userId,
        messagePagedId: pagedMessages.id,
      })
      .returning()
      .then((r) => r[0]);
  } else {
    pagedMessages = await db
      .select()
      .from(messagesPagedTable)
      .where(eq(messagesPagedTable.id, head.messagePagedId))
      .then((r) => r[0]);

    // make new one after 10 messages
  }

  const newMessage = await db
    .insert(messageTable)
    .values({
      from: values.from,
      to: values.to,
      text: values.text,
    })
    .returning()
    .then((r) => r[0]);

  await db
    .update(messagesPagedTable)
    .set({
      messageIds:
        sql.raw(`${messagesPagedTable.messageIds.name} || ARRAY[${newMessage.id}]::integer[]`),
    })
    .where(eq(messagesPagedTable.id, pagedMessages.id));
}
