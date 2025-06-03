import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.ts";
import * as schema from "../db/schema/auth.ts";
import { ORIGIN } from "../consts.ts";

export const auth = betterAuth({
  emailAndPassword: { enabled: false },
  trustedOrigins: ORIGIN,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
      clientSecret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
    },
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
});
