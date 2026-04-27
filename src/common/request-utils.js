const { URL } = require("url");

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

function normalizeText(value) {
  return safeDecode(String(value || ""))
    .replace(/[^\x20-\x7E]+/g, " ")
    .toLowerCase()
    .trim();
}

function collectRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function buildRequestRecord({ method, url, headers = {}, body = "" }) {
  const parsedUrl = new URL(url, "http://localhost");
  const filteredHeaders = {};

  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value === "string" && key.toLowerCase() !== "host") {
      filteredHeaders[key.toLowerCase()] = value;
    }
  });

  return {
    method: String(method || "GET").toUpperCase(),
    path: parsedUrl.pathname,
    query: parsedUrl.search || "",
    url: parsedUrl.pathname + parsedUrl.search,
    headers: filteredHeaders,
    body: String(body || "")
  };
}

function requestRecordToText(record) {
  const headerText = Object.entries(record.headers || {})
    .map(([key, value]) => `${key}:${value}`)
    .join(" ");

  return normalizeText(
    [
      record.method,
      record.path,
      record.query,
      headerText,
      record.body
    ].join(" ")
  );
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function jsonResponse(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body)
  });
  res.end(body);
}

module.exports = {
  buildRequestRecord,
  collectRequestBody,
  jsonResponse,
  normalizeText,
  requestRecordToText,
  safeDecode,
  tryParseJson
};

