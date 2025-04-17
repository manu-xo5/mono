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
    return response({ ids });
  } else if (req.method === "POST") {
    const body = JSON.parse(await req.text());

    if (!("peerId" in body) || !body.peerId) {
      return response({ error: "invalid peerId" }, { status: 400 });
    }

    if (!("displayName" in body) || !body.displayName) {
      return response({ error: "invalid displayName" }, { status: 400 });
    }

    const { peerId, displayName } = body;
    ids.push({ peerId, displayName });

    return response({ data: body });
  } else {
    return response({ message: "method not allowed" });
  }
}

module.exports = {
  handlers,
};

//Deno.serve(handler)
