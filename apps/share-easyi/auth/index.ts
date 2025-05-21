import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.ts";
import * as schema from "../db/schema/auth.ts";

export const auth = betterAuth({
  emailAndPassword: { enabled: false },
  trustedOrigins: ["http://localhost:3000", "https://localhost:3000"],
  advanced: {
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    },
  },
  socialProviders: {
    google: {
      clientId: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
      clientSecret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
      // Change this
      redirectURI: (() => {
        const callbackUri = "/api/auth/callback/google";
        const PUBLIC_DOMAIN = Deno.env.get("RAILWAY_PUBLIC_DOMAIN");
        if (PUBLIC_DOMAIN) {
          return "https://" + PUBLIC_DOMAIN + callbackUri;
        }
        return "http://localhost:1553" + callbackUri;
      })(),
    },
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
});
