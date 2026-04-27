const http = require("http");
const { buildRequestRecord, collectRequestBody, jsonResponse, tryParseJson } = require("../common/request-utils");

const PORT = Number(process.env.BACKEND_PORT || 4000);

function makeResponse(record) {
  const parsedBody = tryParseJson(record.body) || record.body;

  if (record.path === "/health") {
    return { status: 200, payload: { service: "backend", status: "ok" } };
  }

  if (record.path === "/products") {
    return {
      status: 200,
      payload: {
        service: "backend",
        endpoint: "products",
        query: record.query,
        items: [
          { id: 1, name: "Laptop", price: 900 },
          { id: 2, name: "Mouse", price: 25 }
        ]
      }
    };
  }

  if (record.path === "/login") {
    return {
      status: 200,
      payload: {
        service: "backend",
        endpoint: "login",
        accepted: true,
        username: typeof parsedBody === "object" ? parsedBody.username || "unknown" : "submitted"
      }
    };
  }

  if (record.path === "/comments" || record.path === "/feedback") {
    return {
      status: 200,
      payload: {
        service: "backend",
        endpoint: "message",
        saved: true,
        preview: typeof parsedBody === "string" ? parsedBody.slice(0, 80) : parsedBody
      }
    };
  }

  return {
    status: 200,
    payload: {
      service: "backend",
      endpoint: "echo",
      method: record.method,
      path: record.path,
      query: record.query,
      body: parsedBody
    }
  };
}

const server = http.createServer(async (req, res) => {
  const body = await collectRequestBody(req);
  const record = buildRequestRecord({
    method: req.method,
    url: req.url,
    headers: req.headers,
    body
  });
  const response = makeResponse(record);
  jsonResponse(res, response.status, response.payload);
});

server.listen(PORT, () => {
  console.log(`Backend app listening on http://localhost:${PORT}`);
});

