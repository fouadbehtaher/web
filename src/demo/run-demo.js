const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..", "..");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function spawnNode(scriptPath) {
  return spawn(process.execPath, [scriptPath], {
    cwd: ROOT_DIR,
    stdio: "inherit"
  });
}

function sendRequest({ method = "GET", path: requestPath, body = "", headers = {} }) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: requestPath,
        method,
        headers: {
          ...headers,
          "content-length": Buffer.byteLength(body)
        }
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          resolve({
            statusCode: response.statusCode,
            body: Buffer.concat(chunks).toString("utf8")
          });
        });
      }
    );

    request.on("error", reject);

    if (body) {
      request.write(body);
    }

    request.end();
  });
}

async function main() {
  console.log("Training model before demo...");
  const { main: trainModel } = require("../ml/train-model");
  trainModel();

  const backend = spawnNode(path.join(ROOT_DIR, "src", "backend", "server.js"));
  const waf = spawnNode(path.join(ROOT_DIR, "src", "waf", "server.js"));

  try {
    await delay(1500);

    const scenarios = [
      { name: "Benign product request", path: "/products?category=laptops&sort=price" },
      { name: "SQL injection attempt", path: "/login?username=admin'%20OR%201%3D1--&password=x" },
      { name: "XSS attempt", path: "/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E" },
      { name: "Path traversal attempt", path: "/download?file=../../etc/passwd" },
      { name: "Command injection attempt", path: "/tools/ping?host=8.8.8.8;cat%20/etc/passwd" }
    ];

    for (const scenario of scenarios) {
      const result = await sendRequest({ path: scenario.path });
      console.log(`\n[${scenario.name}]`);
      console.log(`Status: ${result.statusCode}`);
      console.log(result.body.slice(0, 300));
    }
  } finally {
    waf.kill();
    backend.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
