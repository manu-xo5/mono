const Express = require("express");
const cors = require("cors");
const { handlers } = require("./index.main");

const PORT = process.env.PORT || 5000;
const app = Express();

app
  .use(cors({ origin: "*" }))
  .use(Express.raw({ type: "text/*" }))
  .all("/", async (req, res) => {
    const fullUrl = [
      req.protocol,
      "://" + req.get("host"),
      req.originalUrl,
    ].join("");

    const request = new Request(fullUrl, {
      method: req.method,
      body: req.method !== "GET" ? req.body.toString("utf8") : undefined,
    });

    const response = await handlers(request);
    res.status(response.status).send(await response.json());
  })
  .listen(PORT, () => console.log(`HTTP listening on ${PORT}`));
