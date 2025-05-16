import { boolean, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth.ts";
import { sql } from "drizzle-orm";

function createIntPrimary<Name extends string>(name: Name) {
  return integer().primaryKey().generatedAlwaysAsIdentity({
    name: name,
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  });
}

export const messageTable = pgTable("message", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({
    name: "messages_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  }),

  from: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  to: text("receiver_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  deleted: boolean("deleted"),

  text: varchar({ length: 512 }).notNull(),
});

export const messagesPagedTable = pgTable("messagesPaged", {
  id: createIntPrimary("messages_paged_id_seq"),

  messageIds: integer("message_ids")
    .array()
    .notNull()
    .default(sql`ARRAY[]::integer[]`),

  prevCursor: integer("prev_cursor"),
  nextCursor: integer("next_cursor"),
});

export const messageOwnerTable = pgTable("messages_owner", {
  id: createIntPrimary("messages_owner_id"),

  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, {
      onDelete: "cascade",
    }),

  messagePagedId: integer("message_paged_id")
    .notNull()
    .unique()
    .references(() => messagesPagedTable.id),
});
