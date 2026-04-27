const state = {
  authenticated: false,
  username: null,
  metrics: null,
  evaluation: null,
  benchmark: null,
  policies: []
};

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  let body = null;
  try {
    body = await response.json();
  } catch (error) {
    body = null;
  }

  if (response.status === 401) {
    applyAuthState({ authenticated: false, username: null, defaultUsername: "admin" });
  }

  if (!response.ok) {
    throw new Error(body?.message || `${options.method || "GET"} failed for ${url}`);
  }

  return body;
}

function fetchJson(url) {
  return requestJson(url);
}

function postJson(url, payload) {
  return requestJson(url, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

function sendJson(url, method = "GET", payload = null) {
  return requestJson(url, {
    method,
    body: payload ? JSON.stringify(payload) : undefined
  });
}

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

function formatChartPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return map[character];
  });
}

function chartRow(label, value, className = "") {
  return `
    <div class="chart-row">
      <header>
        <span>${escapeHtml(label)}</span>
        <strong>${formatChartPercent(value)}</strong>
      </header>
      <div class="chart-track">
        <div class="chart-fill ${className}" style="width:${Math.max(0, Math.min(Number(value || 0), 100))}%"></div>
      </div>
    </div>
  `;
}

function renderTrafficChart(metrics) {
  const container = document.getElementById("traffic-chart");
  const total = Number(metrics?.totalRequests || 0);
  const blocked = total ? (Number(metrics.blockedRequests || 0) / total) * 100 : 0;
  const allowed = total ? (Number(metrics.allowedRequests || 0) / total) * 100 : 0;
  container.innerHTML = [chartRow("Allowed", allowed, "allow"), chartRow("Blocked", blocked, "block")].join("");
}

function renderLabelChart(labels) {
  const container = document.getElementById("label-chart");
  const entries = Object.entries(labels || {}).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (!entries.length || !total) {
    container.innerHTML = `<div class="label-item"><span>No label data yet</span><strong>0</strong></div>`;
    return;
  }

  container.innerHTML = entries
    .map(([label, count]) => chartRow(label, (count / total) * 100, label === "benign" ? "allow" : "block"))
    .join("");
}

function renderLabels(labels) {
  const container = document.getElementById("label-breakdown");
  container.innerHTML = "";

  const entries = Object.entries(labels || {}).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    container.innerHTML = `<div class="label-item"><span>No traffic yet</span><strong>0</strong></div>`;
    return;
  }

  entries.forEach(([label, count]) => {
    const item = document.createElement("div");
    item.className = "label-item";
    item.innerHTML = `<span>${escapeHtml(label)}</span><strong>${count}</strong>`;
    container.appendChild(item);
  });
}

function getEventFilterValue() {
  return document.getElementById("event-filter").value.trim().toLowerCase();
}

function getPolicyFilterValue() {
  return document.getElementById("policy-filter").value.trim().toLowerCase();
}

function filteredEvents(events) {
  const filter = getEventFilterValue();
  if (!filter) {
    return events;
  }

  return events.filter((event) => {
    const haystack = [
      event.url,
      event.action,
      event.finalLabel,
      event.predictedLabel,
      event.matchedPolicy,
      event.method
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(filter);
  });
}

function filteredPolicies(policies) {
  const filter = getPolicyFilterValue();
  if (!filter) {
    return policies;
  }

  return policies.filter((policy) => {
    const haystack = [policy.name, policy.action, policy.field, policy.operator, policy.value]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(filter);
  });
}

function renderEvents(events) {
  const table = document.getElementById("events-table");
  const count = document.getElementById("events-count");
  table.innerHTML = "";

  const visibleEvents = filteredEvents(events);
  count.textContent = `${visibleEvents.length} visible`;

  if (!visibleEvents.length) {
    table.innerHTML = `<tr><td colspan="7">No matching events found.</td></tr>`;
    return;
  }

  visibleEvents.forEach((event) => {
    const row = document.createElement("tr");
    const time = new Date(event.timestamp).toLocaleTimeString();
    row.innerHTML = `
      <td>${escapeHtml(time)}</td>
      <td>${escapeHtml(event.url)}</td>
      <td><span class="status-pill ${escapeHtml(event.action)}">${escapeHtml(event.action)}</span></td>
      <td>${escapeHtml(event.finalLabel || event.predictedLabel || "-")}</td>
      <td>${Number(event.maliciousProbability || 0).toFixed(4)}</td>
      <td>${escapeHtml(event.matchedPolicy || "-")}</td>
      <td>
        <button class="table-action delete" data-delete-event="${escapeHtml(event.id)}" ${
          state.authenticated ? "" : "disabled"
        }>
          Delete
        </button>
      </td>
    `;
    table.appendChild(row);
  });

  document.querySelectorAll("[data-delete-event]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!state.authenticated) {
        showAuthFeedback("Sign in first to delete log entries.");
        return;
      }

      await sendJson(`/waf/events/${encodeURIComponent(button.dataset.deleteEvent)}`, "DELETE");
      await refreshDashboard();
    });
  });
}

function renderPolicies(policies) {
  const container = document.getElementById("policy-list");
  container.innerHTML = "";

  if (!state.authenticated) {
    container.innerHTML = `<div class="label-item"><span>Sign in to view and manage manual policies</span><strong>lock</strong></div>`;
    return;
  }

  const visiblePolicies = filteredPolicies(policies);
  if (!visiblePolicies.length) {
    container.innerHTML = `<div class="label-item"><span>No matching manual policies</span><strong>0</strong></div>`;
    return;
  }

  visiblePolicies.forEach((policy) => {
    const item = document.createElement("div");
    item.className = "policy-item";
    item.innerHTML = `
      <div><strong>${escapeHtml(policy.name)}</strong></div>
      <div class="policy-meta">
        <span>${escapeHtml(policy.action)}</span>
        <span>${escapeHtml(policy.field)}</span>
        <span>${escapeHtml(policy.operator)}</span>
        <span>${escapeHtml(policy.value)}</span>
        <span>${policy.active ? "active" : "inactive"}</span>
      </div>
      <div class="sample-buttons">
        <button class="table-action" data-toggle-policy="${escapeHtml(policy.id)}" data-active="${policy.active}">
          ${policy.active ? "Disable" : "Enable"}
        </button>
        <button class="table-action delete" data-delete-policy="${escapeHtml(policy.id)}">Delete</button>
      </div>
    `;
    container.appendChild(item);
  });

  document.querySelectorAll("[data-delete-policy]").forEach((button) => {
    button.addEventListener("click", async () => {
      await sendJson(`/waf/policies/${encodeURIComponent(button.dataset.deletePolicy)}`, "DELETE");
      await refreshDashboard();
    });
  });

  document.querySelectorAll("[data-toggle-policy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const active = button.dataset.active === "true";
      await sendJson(`/waf/policies/${encodeURIComponent(button.dataset.togglePolicy)}`, "PATCH", {
        active: !active
      });
      await refreshDashboard();
    });
  });
}

function renderBenchmark(benchmark) {
  document.getElementById("benchmark-meta").textContent = benchmark.generatedAt
    ? `Updated ${new Date(benchmark.generatedAt).toLocaleString()}`
    : "No data";
  document.getElementById("bench-total").textContent = benchmark.totalRequests ?? "-";
  document.getElementById("bench-latency").textContent =
    benchmark.averageLatencyMs != null ? `${benchmark.averageLatencyMs} ms` : "-";

  const container = document.getElementById("benchmark-scenarios");
  container.innerHTML = "";

  (benchmark.scenarios || []).forEach((scenario) => {
    const item = document.createElement("div");
    item.className = "label-item";
    item.innerHTML = `
      <span>${escapeHtml(scenario.name)}<br><small>allow=${scenario.allowedCount}, block=${scenario.blockedCount}</small></span>
      <strong>${scenario.averageLatencyMs} ms</strong>
    `;
    container.appendChild(item);
  });
}

function setAdminControlsEnabled(enabled) {
  [
    "policy-name",
    "policy-action",
    "policy-field",
    "policy-operator",
    "policy-value",
    "load-block-sample",
    "load-allow-sample",
    "clear-logs-button",
    "policy-filter"
  ].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.disabled = !enabled;
    }
  });

  const policySubmit = document.querySelector('#policy-form button[type="submit"]');
  if (policySubmit) {
    policySubmit.disabled = !enabled;
  }

  ["export-events-link", "export-policies-link"].forEach((id) => {
    const link = document.getElementById(id);
    if (link) {
      link.classList.toggle("disabled", !enabled);
      link.setAttribute("aria-disabled", enabled ? "false" : "true");
      if (!enabled) {
        link.tabIndex = -1;
      } else {
        link.removeAttribute("tabindex");
      }
    }
  });
}

function showAuthFeedback(message) {
  document.getElementById("auth-feedback").textContent = message;
}

function applyAuthState(auth) {
  state.authenticated = Boolean(auth?.authenticated);
  state.username = auth?.username || null;

  document.getElementById("auth-state").textContent = state.authenticated
    ? `Admin: ${state.username}`
    : `Not signed in${auth?.defaultUsername ? ` | default user: ${auth.defaultUsername}` : ""}`;

  document.getElementById("auth-overlay").classList.toggle("hidden", state.authenticated);
  document.getElementById("logout-button").classList.toggle("hidden", !state.authenticated);

  if (state.authenticated) {
    showAuthFeedback(`Signed in successfully as ${state.username}.`);
  }

  setAdminControlsEnabled(state.authenticated);
}

async function loadAuthStatus() {
  const auth = await fetchJson("/waf/auth/status");
  applyAuthState(auth);
}

async function refreshDashboard() {
  const [status, metrics, evaluation, benchmark] = await Promise.all([
    fetchJson("/waf/status"),
    fetchJson("/waf/metrics"),
    fetchJson("/waf/evaluation"),
    fetchJson("/waf/benchmark").catch(() => ({}))
  ]);

  state.metrics = metrics;
  state.evaluation = evaluation;
  state.benchmark = benchmark;

  document.getElementById("service-status").textContent = status.status.toUpperCase();
  document.getElementById("total-requests").textContent = metrics.totalRequests;
  document.getElementById("blocked-requests").textContent = metrics.blockedRequests;
  document.getElementById("allowed-requests").textContent = metrics.allowedRequests;
  document.getElementById("block-rate").textContent = formatPercent(metrics.blockRate);

  document.getElementById("eval-accuracy").textContent = formatPercent(
    evaluation.binaryDetection?.accuracy || 0
  );
  document.getElementById("eval-precision").textContent = formatPercent(
    evaluation.binaryDetection?.precision || 0
  );
  document.getElementById("eval-recall").textContent = formatPercent(
    evaluation.binaryDetection?.recall || 0
  );
  document.getElementById("eval-f1").textContent = formatPercent(
    evaluation.binaryDetection?.f1 || 0
  );
  document.getElementById("evaluation-meta").textContent = evaluation.evaluatedAt
    ? `Updated ${new Date(evaluation.evaluatedAt).toLocaleString()}`
    : "No data";

  renderLabels(metrics.labels || {});
  renderEvents(metrics.recentEvents || []);
  renderTrafficChart(metrics || {});
  renderLabelChart(metrics.labels || {});
  renderBenchmark(benchmark || {});

  if (state.authenticated) {
    state.policies = await fetchJson("/waf/policies").catch(() => []);
  } else {
    state.policies = [];
  }

  renderPolicies(state.policies);
}

document.getElementById("refresh-button").addEventListener("click", () => {
  refreshDashboard().catch((error) => console.error(error));
});

const samples = {
  benign: {
    method: "GET",
    url: "/products?category=laptops&sort=price",
    headers: { "user-agent": "dashboard-demo" },
    body: ""
  },
  sql: {
    method: "GET",
    url: "/login?username=admin'%20OR%201%3D1--&password=x",
    headers: { "user-agent": "dashboard-demo" },
    body: ""
  },
  xss: {
    method: "GET",
    url: "/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E",
    headers: { "user-agent": "dashboard-demo" },
    body: ""
  },
  traversal: {
    method: "GET",
    url: "/download?file=../../etc/passwd",
    headers: { "user-agent": "dashboard-demo" },
    body: ""
  },
  command: {
    method: "GET",
    url: "/tools/ping?host=8.8.8.8;cat%20/etc/passwd",
    headers: { "user-agent": "dashboard-demo" },
    body: ""
  }
};

function loadSample(sample) {
  document.getElementById("lab-method").value = sample.method;
  document.getElementById("lab-url").value = sample.url;
  document.getElementById("lab-headers").value = JSON.stringify(sample.headers, null, 2);
  document.getElementById("lab-body").value = sample.body;
}

document.querySelectorAll("[data-sample]").forEach((button) => {
  button.addEventListener("click", () => {
    loadSample(samples[button.dataset.sample]);
  });
});

document.getElementById("classify-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const method = document.getElementById("lab-method").value;
  const url = document.getElementById("lab-url").value;
  const body = document.getElementById("lab-body").value;
  const headersText = document.getElementById("lab-headers").value;
  const summary = document.getElementById("lab-summary");
  const output = document.getElementById("lab-output");

  let headers;
  try {
    headers = headersText.trim() ? JSON.parse(headersText) : {};
  } catch (error) {
    summary.textContent = "Headers must be valid JSON.";
    output.textContent = error.message;
    return;
  }

  summary.textContent = "Classifying request...";
  output.textContent = "";

  try {
    const result = await postJson("/waf/classify", { method, url, headers, body });
    summary.textContent = `Decision: ${result.action.toUpperCase()} | Final label: ${result.finalLabel} | Confidence: ${Number(
      result.maliciousProbability || 0
    ).toFixed(4)}`;
    output.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    summary.textContent = "Classification failed.";
    output.textContent = error.message;
  }
});

document.getElementById("send-live-button").addEventListener("click", async () => {
  const method = document.getElementById("lab-method").value;
  const url = document.getElementById("lab-url").value;
  const body = document.getElementById("lab-body").value;
  const headersText = document.getElementById("lab-headers").value;
  const summary = document.getElementById("lab-summary");
  const output = document.getElementById("lab-output");

  let headers;
  try {
    headers = headersText.trim() ? JSON.parse(headersText) : {};
  } catch (error) {
    summary.textContent = "Headers must be valid JSON.";
    output.textContent = error.message;
    return;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: ["GET", "DELETE"].includes(method) ? undefined : body
    });
    const text = await response.text();
    summary.textContent = `Live request completed with status ${response.status}.`;
    output.textContent = text;
    await refreshDashboard();
  } catch (error) {
    summary.textContent = "Live request failed.";
    output.textContent = error.message;
  }
});

document.getElementById("policy-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!state.authenticated) {
    showAuthFeedback("Sign in first to add a manual policy.");
    return;
  }

  const payload = {
    name: document.getElementById("policy-name").value,
    action: document.getElementById("policy-action").value,
    field: document.getElementById("policy-field").value,
    operator: document.getElementById("policy-operator").value,
    value: document.getElementById("policy-value").value
  };

  await sendJson("/waf/policies", "POST", payload);
  document.getElementById("policy-feedback").textContent = "Policy added successfully.";
  await refreshDashboard();
});

document.getElementById("load-block-sample").addEventListener("click", () => {
  document.getElementById("policy-name").value = "Block Admin Paths";
  document.getElementById("policy-action").value = "block";
  document.getElementById("policy-field").value = "path";
  document.getElementById("policy-operator").value = "startsWith";
  document.getElementById("policy-value").value = "/admin";
});

document.getElementById("load-allow-sample").addEventListener("click", () => {
  document.getElementById("policy-name").value = "Allow Reports Route";
  document.getElementById("policy-action").value = "allow";
  document.getElementById("policy-field").value = "path";
  document.getElementById("policy-operator").value = "equals";
  document.getElementById("policy-value").value = "/reports";
});

document.getElementById("clear-logs-button").addEventListener("click", async () => {
  if (!state.authenticated) {
    showAuthFeedback("Sign in first to clear logs.");
    return;
  }
  await sendJson("/waf/events/clear", "POST");
  await refreshDashboard();
});

document.getElementById("event-filter").addEventListener("input", () => {
  renderEvents(state.metrics?.recentEvents || []);
});

document.getElementById("policy-filter").addEventListener("input", () => {
  renderPolicies(state.policies || []);
});

document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const auth = await postJson("/waf/auth/login", { username, password });
    applyAuthState({ ...auth, defaultUsername: "admin" });
    await refreshDashboard();
  } catch (error) {
    showAuthFeedback(error.message);
  }
});

document.getElementById("logout-button").addEventListener("click", async () => {
  await postJson("/waf/auth/logout", {});
  applyAuthState({ authenticated: false, username: null, defaultUsername: "admin" });
  await refreshDashboard();
});

Promise.resolve()
  .then(loadAuthStatus)
  .then(refreshDashboard)
  .catch((error) => {
    document.getElementById("service-status").textContent = "ERROR";
    console.error(error);
  });

setInterval(() => {
  refreshDashboard().catch((error) => console.error(error));
}, 5000);
