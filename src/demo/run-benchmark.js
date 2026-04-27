const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");
const { main: trainModel } = require("../ml/train-model");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const RESULT_JSON = path.join(ROOT_DIR, "results", "runtime-benchmark.json");
const RESULT_MD = path.join(ROOT_DIR, "results", "runtime-benchmark.md");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function spawnNode(scriptPath) {
  return spawn(process.execPath, [scriptPath], {
    cwd: ROOT_DIR,
    stdio: "inherit"
  });
}

function requestOnce(pathname) {
  return new Promise((resolve, reject) => {
    const startedAt = process.hrtime.bigint();
    const request = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: pathname,
        method: "GET"
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const finishedAt = process.hrtime.bigint();
          const elapsedMs = Number(finishedAt - startedAt) / 1e6;
          resolve({
            path: pathname,
            statusCode: response.statusCode || 0,
            latencyMs: Number(elapsedMs.toFixed(3)),
            body: Buffer.concat(chunks).toString("utf8")
          });
        });
      }
    );

    request.on("error", reject);
    request.end();
  });
}

function summarizeScenario(name, requests) {
  const total = requests.length;
  const averageLatencyMs =
    requests.reduce((sum, item) => sum + item.latencyMs, 0) / Math.max(1, total);
  const blockedCount = requests.filter((item) => item.statusCode === 403).length;
  const allowedCount = requests.filter((item) => item.statusCode === 200).length;

  return {
    name,
    totalRequests: total,
    averageLatencyMs: Number(averageLatencyMs.toFixed(3)),
    minLatencyMs: Number(Math.min(...requests.map((item) => item.latencyMs)).toFixed(3)),
    maxLatencyMs: Number(Math.max(...requests.map((item) => item.latencyMs)).toFixed(3)),
    blockedCount,
    allowedCount
  };
}

async function main() {
  trainModel();

  const backend = spawnNode(path.join(ROOT_DIR, "src", "backend", "server.js"));
  const waf = spawnNode(path.join(ROOT_DIR, "src", "waf", "server.js"));

  try {
    await delay(1500);

    const scenarios = [
      {
        name: "benign",
        path: "/products?category=laptops&sort=price",
        iterations: 12
      },
      {
        name: "sql_injection",
        path: "/login?username=admin'%20OR%201%3D1--&password=x",
        iterations: 8
      },
      {
        name: "xss",
        path: "/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E",
        iterations: 8
      },
      {
        name: "path_traversal",
        path: "/download?file=../../etc/passwd",
        iterations: 8
      },
      {
        name: "command_injection",
        path: "/tools/ping?host=8.8.8.8;cat%20/etc/passwd",
        iterations: 8
      }
    ];

    const scenarioResults = [];

    for (const scenario of scenarios) {
      const requests = [];
      for (let index = 0; index < scenario.iterations; index += 1) {
        requests.push(await requestOnce(scenario.path));
      }
      scenarioResults.push(summarizeScenario(scenario.name, requests));
    }

    const overall = {
      generatedAt: new Date().toISOString(),
      totalRequests: scenarioResults.reduce((sum, item) => sum + item.totalRequests, 0),
      averageLatencyMs: Number(
        (
          scenarioResults.reduce((sum, item) => sum + item.averageLatencyMs * item.totalRequests, 0) /
          scenarioResults.reduce((sum, item) => sum + item.totalRequests, 0)
        ).toFixed(3)
      ),
      scenarios: scenarioResults
    };

    fs.mkdirSync(path.dirname(RESULT_JSON), { recursive: true });
    fs.writeFileSync(RESULT_JSON, JSON.stringify(overall, null, 2));
    fs.writeFileSync(
      RESULT_MD,
      [
        "# Runtime Benchmark",
        "",
        `Generated at: ${overall.generatedAt}`,
        "",
        `Total requests: ${overall.totalRequests}`,
        `Average latency: ${overall.averageLatencyMs} ms`,
        "",
        "## Scenario Summary",
        "",
        ...scenarioResults.map(
          (item) =>
            `- ${item.name}: avg=${item.averageLatencyMs} ms, min=${item.minLatencyMs} ms, max=${item.maxLatencyMs} ms, allowed=${item.allowedCount}, blocked=${item.blockedCount}`
        )
      ].join("\n")
    );

    console.log(JSON.stringify(overall, null, 2));
  } finally {
    waf.kill();
    backend.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

