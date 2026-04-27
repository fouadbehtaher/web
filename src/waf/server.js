const fs = require("fs");
const http = require("http");
const path = require("path");
const {
  appendLog,
  clearLogs,
  deleteLogEntryById,
  readLogEntries,
  summarizeEntries
} = require("../common/logger");
const { contentTypeFor, readJsonIfExists, readTextIfExists } = require("../common/artifact-utils");
const {
  buildRequestRecord,
  collectRequestBody,
  jsonResponse,
  tryParseJson
} = require("../common/request-utils");
const { decideRequest } = require("./decision-engine");
const { createSession, deleteSession, getAuthConfig, getSession, validateCredentials } = require("./auth-store");
const { createPolicy, deletePolicy, loadPolicies, updatePolicy } = require("./policy-store");

const PORT = Number(process.env.WAF_PORT || 3000);
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 4000);
const MODEL_PATH = path.resolve(__dirname, "..", "..", "models", "trained-model.json");
const EVALUATION_PATH = path.resolve(__dirname, "..", "..", "results", "evaluation-summary.json");
const BENCHMARK_JSON_PATH = path.resolve(__dirname, "..", "..", "results", "runtime-benchmark.json");
const BENCHMARK_MD_PATH = path.resolve(__dirname, "..", "..", "results", "runtime-benchmark.md");
const PUBLIC_DIR = path.resolve(__dirname, "..", "..", "public", "dashboard");

function loadModel() {
  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error(`Model file not found at ${MODEL_PATH}. Run: node src/ml/train-model.js`);
  }

  return JSON.parse(fs.readFileSync(MODEL_PATH, "utf8"));
}

const model = loadModel();

function serveStaticFile(res, filePath) {
  if (!fs.existsSync(filePath)) {
    return jsonResponse(res, 404, { message: "File not found." });
  }

  const body = fs.readFileSync(filePath);
  res.writeHead(200, {
    "content-type": contentTypeFor(filePath),
    "content-length": body.length
  });
  res.end(body);
  return undefined;
}

function proxyRequest(req, res, body, decision) {
  const proxy = http.request(
    {
      hostname: "localhost",
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${BACKEND_PORT}`,
        "content-length": Buffer.byteLength(body),
        "x-waf-decision": decision.action,
        "x-waf-label": decision.finalLabel,
        "x-waf-confidence": String(decision.maliciousProbability)
      }
    },
    (proxyResponse) => {
      res.writeHead(proxyResponse.statusCode || 200, proxyResponse.headers);
      proxyResponse.pipe(res);
    }
  );

  proxy.on("error", (error) => {
    jsonResponse(res, 502, {
      message: "Failed to contact backend application.",
      error: error.message
    });
  });

  if (body) {
    proxy.write(body);
  }

  proxy.end();
}

function parsePolicyIdFromPath(requestPath) {
  const segments = requestPath.split("/").filter(Boolean);
  return segments.length >= 3 ? decodeURIComponent(segments[2]) : null;
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        if (index === -1) {
          return [part, ""];
        }
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function getSessionFromRequest(req) {
  const cookies = parseCookies(req);
  return getSession(cookies.waf_admin_session);
}

function setSessionCookie(res, token) {
  res.setHeader("Set-Cookie", `waf_admin_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax`);
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", "waf_admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
}

function requireAdmin(req, res) {
  const session = getSessionFromRequest(req);
  if (!session) {
    jsonResponse(res, 401, { message: "Admin authentication required." });
    return null;
  }
  return session;
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function sendCsv(res, rows, fileName) {
  const content = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  res.writeHead(200, {
    "content-type": "text/csv; charset=utf-8",
    "content-disposition": `attachment; filename="${fileName}"`,
    "content-length": Buffer.byteLength(content)
  });
  res.end(content);
}

const server = http.createServer(async (req, res) => {
  const body = await collectRequestBody(req);
  const record = buildRequestRecord({
    method: req.method,
    url: req.url,
    headers: req.headers,
    body
  });

  if (record.path === "/waf/status") {
    const metrics = summarizeEntries(readLogEntries());
    return jsonResponse(res, 200, {
      service: "ai-based-waf",
      status: "ok",
      modelGeneratedAt: model.generatedAt,
      labels: model.labels,
      vocabularySize: model.vocabularySize,
      backendPort: BACKEND_PORT,
      wafPort: PORT,
      totalRequests: metrics.totalRequests
    });
  }

  if (record.path === "/waf/auth/status") {
    const session = getSessionFromRequest(req);
    return jsonResponse(res, 200, {
      authenticated: Boolean(session),
      username: session ? session.username : null,
      defaultUsername: getAuthConfig().username
    });
  }

  if (record.path === "/waf/auth/login" && record.method === "POST") {
    const payload = tryParseJson(body) || {};
    const username = String(payload.username || "");
    const password = String(payload.password || "");
    if (!validateCredentials(username, password)) {
      return jsonResponse(res, 401, { message: "Invalid admin credentials." });
    }
    const session = createSession();
    setSessionCookie(res, session.token);
    return jsonResponse(res, 200, {
      authenticated: true,
      username: session.username
    });
  }

  if (record.path === "/waf/auth/logout" && record.method === "POST") {
    const session = getSessionFromRequest(req);
    if (session) {
      deleteSession(session.token);
    }
    clearSessionCookie(res);
    return jsonResponse(res, 200, { authenticated: false });
  }

  if (record.path === "/dashboard" || record.path === "/dashboard/") {
    return serveStaticFile(res, path.join(PUBLIC_DIR, "index.html"));
  }

  if (record.path.startsWith("/dashboard/")) {
    const relativePath = record.path.replace("/dashboard/", "");
    return serveStaticFile(res, path.join(PUBLIC_DIR, relativePath));
  }

  if (record.path === "/waf/metrics") {
    return jsonResponse(res, 200, summarizeEntries(readLogEntries()));
  }

  if (record.path === "/waf/policies" && record.method === "GET") {
    if (!requireAdmin(req, res)) {
      return undefined;
    }
    return jsonResponse(res, 200, loadPolicies());
  }

  if (record.path === "/waf/policies" && record.method === "POST") {
    if (!requireAdmin(req, res)) {
      return undefined;
    }
    const payload = tryParseJson(body) || {};
    return jsonResponse(res, 201, createPolicy(payload));
  }

  if (record.path.startsWith("/waf/policies/") && record.method === "DELETE") {
    if (!requireAdmin(req, res)) {
      return undefined;
    }
    const id = parsePolicyIdFromPath(record.path);
    const deleted = deletePolicy(id);
    return jsonResponse(res, deleted ? 200 : 404, {
      deleted,
      id
    });
  }

  if (record.path.startsWith("/waf/policies/") && record.method === "PATCH") {
    if (!requireAdmin(req, res)) {
      return undefined;
    }
    const id = parsePolicyIdFromPath(record.path);
    const payload = tryParseJson(body) || {};
    const updated = updatePolicy(id, payload);
    return jsonResponse(res, updated ? 200 : 404, updated || { message: "Policy not found." });
  }

  if (record.path === "/waf/events") {
    if (!requireAdmin(req, res)) {
      return undefined;
    }
    return jsonResponse(res, 200, readLogEntries());
  }

  if (record.path === "/waf/events/clear" && record.method === "POST") {
    if (!requireAdmin(req, res)) {
      return undefined;
    }
    clearLogs();
    return jsonResponse(res, 200, { cleared: true });
  }

  if (record.path.startsWith("/waf/events/") && record.method === "DELETE") {
    if (!requireAdmin(req, res)) {
      return undefined;
    }
    const id = parsePolicyIdFromPath(record.path);
    const deleted = deleteLogEntryById(id);
    return jsonResponse(res, deleted ? 200 : 404, { deleted, id });
  }

  if (record.path === "/waf/export/events.csv") {
    if (!requireAdmin(req, res)) {
      return undefined;
    }
    const entries = readLogEntries(5000);
    const rows = [
      ["id", "timestamp", "method", "url", "action", "finalLabel", "predictedLabel", "maliciousProbability", "matchedPolicy"]
    ].concat(
      entries.map((entry) => [
        entry.id,
        entry.timestamp,
        entry.method,
        entry.url,
        entry.action,
        entry.finalLabel,
        entry.predictedLabel,
        entry.maliciousProbability,
        entry.matchedPolicy || ""
      ])
    );
    return sendCsv(res, rows, "waf-events.csv");
  }

  if (record.path === "/waf/export/policies.csv") {
    if (!requireAdmin(req, res)) {
      return undefined;
    }
    const policies = loadPolicies();
    const rows = [["id", "name", "action", "field", "operator", "value", "active", "createdAt"]].concat(
      policies.map((policy) => [
        policy.id,
        policy.name,
        policy.action,
        policy.field,
        policy.operator,
        policy.value,
        policy.active,
        policy.createdAt
      ])
    );
    return sendCsv(res, rows, "waf-policies.csv");
  }

  if (record.path === "/waf/evaluation") {
    return jsonResponse(res, 200, readJsonIfExists(EVALUATION_PATH, { message: "No evaluation result found." }));
  }

  if (record.path === "/waf/benchmark") {
    return jsonResponse(res, 200, readJsonIfExists(BENCHMARK_JSON_PATH, { message: "No benchmark result found." }));
  }

  if (record.path === "/waf/benchmark-report") {
    const markdown = readTextIfExists(BENCHMARK_MD_PATH, "# No benchmark report found.\n");
    res.writeHead(200, {
      "content-type": "text/markdown; charset=utf-8",
      "content-length": Buffer.byteLength(markdown)
    });
    res.end(markdown);
    return undefined;
  }

  if (record.path === "/waf/classify" && record.method === "POST") {
    const payload = tryParseJson(body) || {};
    const classificationRecord = buildRequestRecord({
      method: payload.method || "GET",
      url: payload.url || "/",
      headers: payload.headers || {},
      body: payload.body || ""
    });
    const decision = decideRequest(model, classificationRecord);
    return jsonResponse(res, 200, decision);
  }

  const decision = decideRequest(model, record);
  appendLog({
    id: `evt-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    method: record.method,
    url: record.url,
    action: decision.action,
    finalLabel: decision.finalLabel,
    predictedLabel: decision.predictedLabel,
    maliciousProbability: decision.maliciousProbability,
    matchedRules: decision.matchedRules,
    matchedPolicy: decision.matchedPolicy ? decision.matchedPolicy.id : null
  });

  if (decision.action === "block") {
    return jsonResponse(res, 403, {
      message: "Request blocked by AI-Based WAF.",
      predictedAttack: decision.predictedLabel,
      maliciousProbability: decision.maliciousProbability,
      decisionSource: decision.decisionSource,
      matchedRules: decision.matchedRules,
      matchedPolicy: decision.matchedPolicy,
      matchedFeatureRules: decision.matchedFeatureRules,
      explanation: decision.explanation
    });
  }

  return proxyRequest(req, res, body, decision);
});

server.listen(PORT, () => {
  console.log(`WAF gateway listening on http://localhost:${PORT}`);
});
