const users = {};
const ids = [];

function createPin() {
  return Array.from(crypto.getRandomValues(new Uint8Array(2)))
    .map((x) => (x % 90) + 10)
    .join("");
}

/**
 * @param {*} body
 * @param {ResponseInit} init
 */
function response(body, init) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
    },
    ...init,
  });
}

/**
 * @param {Request} req
 */
async function handlers(req) {
  if (req.method === "GET") {
    const query = new URL(req.url).searchParams;
    const offer = ids.get(query.get("pin"));

    return response({ offer });
  } else if (req.method === "POST") {
    const newPin = createPin();
    const body = JSON.parse(await req.text());

    ids.push(newPin);

    return response({
      pin: newPin,
    });
  } else {
    return response({
      message: "method not allowed",
    });
  }
}

module.exports = {
  handlers,
};

//Deno.serve(handler)
