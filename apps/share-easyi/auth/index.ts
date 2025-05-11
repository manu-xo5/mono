import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.ts";
import * as schema from "../db/schema/auth.ts";

export const auth = betterAuth({
  emailAndPassword: { enabled: false },
  trustedOrigins: ["http://localhost:3000"],
  socialProviders: {
    google: {
      clientId: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
      clientSecret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
      redirectURI: "http://localhost:1553/api/auth/callback/google",
    },
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
});
