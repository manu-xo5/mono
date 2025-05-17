import { MiddlewareHandler } from "hono";
import { auth } from "./index.ts";

export function authMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    if (c.req.method.toLowerCase() == "options") {
      console.log(c.req.path);
      await next();
    }

    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      return c.json({}, 403);
    }

    c.set("user", session.user);
    c.set("session", session.session);
    return next();
  };
}
