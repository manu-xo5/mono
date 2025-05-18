import { Context, Hono } from "hono";

type Router = {
  _type: "router";
  routes: Hono;
};

type QueryHandler = {
  _type: "handler";
  method: "GET";
  handler: (c: Context) => Promise<Response> | Response;
};

function query(fn: QueryHandler["handler"]): QueryHandler {
  return {
    _type: "handler",
    method: "GET",
    handler: fn,
  };
}

function mutation(fn: QueryHandler["handler"]): MutationHandler {
  return {
    _type: "handler",
    method: "POST",
    handler: fn,
  };
}

type MutationHandler = {
  _type: "handler";
  method: "POST";
  handler: (c: Context) => Promise<Response> | Response;
};

function router(
  procedures: Record<string, QueryHandler | MutationHandler | Router>,
): Router {
  const app = new Hono();

  for (const [path, proc] of Object.entries(procedures)) {
    if (proc._type == "handler") {
      if (proc.method == "GET") {
        app.get("/" + path, proc.handler);
      } else if (proc.method == "POST") {
        app.post("/" + path, proc.handler);
      }
    } else if (proc._type == "router") {
      app.route("/" + path, proc.routes);
    }
  }

  return {
    _type: "router",
    routes: app,
  };
}

const example = router({
  helloworld: query((c) => {
    return c.text("hello world");
  }),

  ping: mutation(async (c) => {
    console.log(await c.req.json());

    return c.text("updated");
  }),

  v2: router({
    helloworld: query((c) => c.text("v2: hello world")),
    ping: query((c) => c.text("pong")),
  }),
});

console.dir(example.routes.routes, { depth: null });

export const hr = {
  router,
  query,
  mutation,
};
