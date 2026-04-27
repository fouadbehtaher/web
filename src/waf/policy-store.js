const fs = require("fs");
const path = require("path");
const { requestRecordToText } = require("../common/request-utils");

const POLICY_PATH = path.resolve(__dirname, "..", "..", "data", "manual-policies.json");

function ensurePolicyFile() {
  fs.mkdirSync(path.dirname(POLICY_PATH), { recursive: true });
  if (!fs.existsSync(POLICY_PATH)) {
    fs.writeFileSync(POLICY_PATH, "[]");
  }
}

function loadPolicies() {
  ensurePolicyFile();
  return JSON.parse(fs.readFileSync(POLICY_PATH, "utf8"));
}

function savePolicies(policies) {
  ensurePolicyFile();
  fs.writeFileSync(POLICY_PATH, JSON.stringify(policies, null, 2));
}

function createPolicy(input) {
  const policies = loadPolicies();
  const policy = {
    id: `policy-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: String(input.name || "Manual Policy"),
    action: input.action === "allow" ? "allow" : "block",
    field: input.field || "url",
    operator: input.operator || "contains",
    value: String(input.value || ""),
    active: input.active !== false,
    createdAt: new Date().toISOString()
  };
  policies.push(policy);
  savePolicies(policies);
  return policy;
}

function deletePolicy(id) {
  const policies = loadPolicies();
  const filtered = policies.filter((policy) => policy.id !== id);
  savePolicies(filtered);
  return filtered.length !== policies.length;
}

function updatePolicy(id, partial) {
  const policies = loadPolicies();
  let updated = null;
  const next = policies.map((policy) => {
    if (policy.id !== id) {
      return policy;
    }
    updated = {
      ...policy,
      ...partial
    };
    return updated;
  });
  savePolicies(next);
  return updated;
}

function getFieldValue(record, field) {
  if (field === "path") {
    return record.path || "";
  }
  if (field === "body") {
    return record.body || "";
  }
  if (field === "query") {
    return record.query || "";
  }
  if (field === "text") {
    return requestRecordToText(record);
  }
  return record.url || "";
}

function doesPolicyMatch(policy, record) {
  const target = String(getFieldValue(record, policy.field));
  const value = String(policy.value || "");

  if (!value) {
    return false;
  }

  if (policy.operator === "equals") {
    return target === value;
  }
  if (policy.operator === "startsWith") {
    return target.startsWith(value);
  }
  if (policy.operator === "regex") {
    try {
      return new RegExp(value, "i").test(target);
    } catch (error) {
      return false;
    }
  }
  return target.toLowerCase().includes(value.toLowerCase());
}

function findMatchingPolicy(record) {
  return loadPolicies().find((policy) => policy.active && doesPolicyMatch(policy, record)) || null;
}

module.exports = {
  POLICY_PATH,
  createPolicy,
  deletePolicy,
  findMatchingPolicy,
  loadPolicies,
  updatePolicy
};

