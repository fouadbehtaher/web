const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { decideRequest } = require("../src/waf/decision-engine");
const { buildRequestRecord, normalizeText, safeDecode } = require("../src/common/request-utils");

const model = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "..", "models", "trained-model.json"), "utf8")
);

const BROWSER_HEADERS = { "user-agent": "Mozilla/5.0", accept: "text/html" };

function decide(method, url, body = "") {
  return decideRequest(model, buildRequestRecord({ method, url, headers: BROWSER_HEADERS, body }));
}

test("buildRequestRecord drops the host header and lowercases the rest", () => {
  const record = buildRequestRecord({
    method: "get",
    url: "/items?id=1",
    headers: { Host: "example.test", "User-Agent": "unit" }
  });
  assert.equal(record.method, "GET");
  assert.equal(record.path, "/items");
  assert.equal(record.query, "?id=1");
  assert.deepEqual(record.headers, { "user-agent": "unit" });
});

test("normalizeText decodes percent-encoding and lowercases", () => {
  assert.equal(normalizeText("%3CScript%3E"), "<script>");
  assert.equal(safeDecode("%E0%A4%A"), "%E0%A4%A");
});

const HARD_BLOCKS = [
  ["SQL union select", "/search?q=1 UNION SELECT username,password FROM users", "rule-sql-union", "sql_injection"],
  ["script tag", "/comment?text=%3Cscript%3Ealert(1)%3C/script%3E", "rule-script-tag", "xss"],
  ["path traversal", "/download?file=../../etc/passwd", "rule-traversal", "path_traversal"],
  ["command chain", "/ping?host=1.1.1.1;cat /etc/passwd", "rule-command-chain", "command_injection"]
];

for (const [name, url, ruleId, label] of HARD_BLOCKS) {
  test(`blocks ${name} through its hard rule`, () => {
    const decision = decide("GET", url);
    assert.equal(decision.action, "block");
    assert.ok(decision.matchedRules.includes(ruleId), `expected ${ruleId}, got ${decision.matchedRules}`);
    assert.equal(decision.finalLabel, label);
    assert.equal(decision.decisionSource, "rule+ml");
  });
}

test("allows an ordinary browser product request", () => {
  const decision = decide("GET", "/products?id=5&sort=price");
  assert.equal(decision.action, "allow");
  assert.equal(decision.finalLabel, "benign");
  assert.deepEqual(decision.matchedRules, []);
});

test("a stored block policy for /admin wins over the model", () => {
  const decision = decide("GET", "/admin/users");
  assert.equal(decision.action, "block");
  assert.equal(decision.decisionSource, "manual-policy");
  assert.equal(decision.maliciousProbability, 1);
});

test("allows ordinary requests that carry a query string but no headers", () => {
  const decide0 = (url) => decideRequest(model, buildRequestRecord({ method: "GET", url, headers: {}, body: "" }));
  for (const url of ["/products?id=5&sort=price", "/api/items?page=2&limit=20", "/search?q=usb+c+cable"]) {
    assert.equal(decide0(url).action, "allow", url);
  }
});

test("holdout set: false positives stay at or below 5% and detection at or above 90%", () => {
  const { evaluate } = require("../src/ml/evaluate-holdout");
  const samples = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "data", "holdout-samples.json"), "utf8"));
  const result = evaluate(path.resolve(__dirname, "..", "models", "trained-model.json"), samples);
  assert.ok(result.falsePositiveRate <= 0.05, `false positive rate ${result.falsePositiveRate}`);
  assert.ok(result.detectionRateFullDecision >= 0.9, `detection ${result.detectionRateFullDecision}`);
});
