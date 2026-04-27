const fs = require("fs");
const path = require("path");

const LOG_PATH = path.resolve(__dirname, "..", "..", "logs", "waf-events.log");

function appendLog(entry) {
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.appendFileSync(LOG_PATH, `${JSON.stringify(entry)}\n`);
}

function readLogEntries(limit = 200) {
  if (!fs.existsSync(LOG_PATH)) {
    return [];
  }

  return fs
    .readFileSync(LOG_PATH, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        const parsed = JSON.parse(line);
        if (!parsed.id) {
          parsed.id = `legacy-${index}-${parsed.timestamp || "event"}`;
        }
        return parsed;
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean)
    .slice(-limit);
}

function summarizeEntries(entries) {
  const summary = {
    totalRequests: entries.length,
    allowedRequests: 0,
    blockedRequests: 0,
    labels: {},
    recentEvents: entries.slice(-20).reverse()
  };

  entries.forEach((entry) => {
    if (entry.action === "block") {
      summary.blockedRequests += 1;
    } else {
      summary.allowedRequests += 1;
    }

    const label = entry.finalLabel || entry.predictedLabel || "unknown";
    summary.labels[label] = (summary.labels[label] || 0) + 1;
  });

  summary.blockRate =
    summary.totalRequests === 0
      ? 0
      : Number((summary.blockedRequests / summary.totalRequests).toFixed(4));

  return summary;
}

function writeLogEntries(entries) {
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  const content = entries.map((entry) => JSON.stringify(entry)).join("\n");
  fs.writeFileSync(LOG_PATH, content ? `${content}\n` : "");
}

function clearLogs() {
  writeLogEntries([]);
}

function deleteLogEntryById(id) {
  const entries = readLogEntries(5000);
  const filtered = entries.filter((entry) => entry.id !== id);
  writeLogEntries(filtered);
  return filtered.length !== entries.length;
}

module.exports = {
  appendLog,
  LOG_PATH,
  readLogEntries,
  summarizeEntries,
  writeLogEntries,
  clearLogs,
  deleteLogEntryById
};
