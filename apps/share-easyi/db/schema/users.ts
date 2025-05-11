import { integer, pgTable, unique, varchar } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "users_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    age: integer().notNull(),
    email: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("users_email_unique").on(table.email)],
);

