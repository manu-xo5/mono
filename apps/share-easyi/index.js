const path = require("path");
const { Socket } = require("socket.io");
const Express = require("express");
const cors = require("cors");
const { handlers } = require("./index.main");

const PORT = process.env.PORT || 5000;
const app = Express();
app.use(Express.json());

app.use(
  cors({
    origin: "*",
  }),
);

app.all("/", async (req, res) => {
  console.log(req.url);
  console.log(req.method);
  console.log(req.body);
  const request = new Request(req.url, {
    method: req.method,
    body: req.method !== "GET" ? req.body : undefined,
  });

  const response = await handlers();
  res.status(response.status).send(await response.json());
});

app.listen(PORT, () => console.log(`HTTP listening on ${PORT}`));
