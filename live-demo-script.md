# Live Demo Script

## Demo goal

Show that the WAF allows normal traffic, blocks common attacks, exposes runtime metrics, and explains its decisions.

## Before the demo

1. Open a terminal in the project folder.
2. Run:

```powershell
node src/ml/train-model.js
node src/backend/server.js
node src/waf/server.js
```

3. Open the browser at:

`http://localhost:3000/dashboard`

## Demo flow

### Step 1: Show system status

- Open the dashboard.
- Point to the service status, traffic counters, and evaluation metrics.
- Mention that the gateway is running in front of the backend app.

### Step 2: Show a benign request

Use:

`http://localhost:3000/products?category=laptops&sort=price`

Explain that the request is forwarded normally because it is classified as safe.

### Step 3: Show SQL injection

Use the request lab sample or send:

`/login?username=admin'%20OR%201%3D1--&password=x`

Explain that the request is blocked and the response includes the predicted attack class and explanation tokens.

### Step 4: Show XSS

Use:

`/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E`

Explain that both the ML component and the rule engine recognize the payload.

### Step 5: Show path traversal

Use:

`/download?file=../../etc/passwd`

Explain that traversal patterns are detected and the request is denied.

### Step 6: Show command injection

Use:

`/tools/ping?host=8.8.8.8;cat%20/etc/passwd`

Explain that shell chaining and command markers are recognized.

### Step 7: Show metrics and logs

- Refresh the dashboard.
- Point to increased blocked count.
- Show recent events and label distribution.

### Step 8: Mention benchmark results

- Open `/waf/benchmark` or show the dashboard benchmark section.
- Mention the measured average latency and explain why benign traffic is slower than blocked traffic.

## Final talking point

Close by emphasizing that the project uses a hybrid AI plus rule-based design, which is both practical and explainable for web application protection.

