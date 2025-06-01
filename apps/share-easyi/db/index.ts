import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
import { messageTable, roomRelations, roomTable } from "./schema/message.ts";

if (Deno.env.get("NODE_ENV") === "development") {
  neonConfig.fetchEndpoint = (host) => {
    console.log(`[DEV] neonConfig.fetchEndpoint called for host: ${host}`);
    return "http://localhost:4444/sql";
  };
}

const sql = neon(Deno.env.get("DATABASE_URL")!);

export const db = drizzle({
  client: sql,
  schema: {
    messageTable,
    roomTable,
    roomRelations,
  },
});
