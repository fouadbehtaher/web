# API Reference

## Runtime services

- WAF gateway: `http://localhost:3000`
- Backend app: `http://localhost:4000`

## Public WAF routes

### `GET /waf/status`

Returns service metadata such as model generation time, supported labels, configured ports, and total processed requests.

### `GET /waf/metrics`

Returns aggregated runtime metrics from the WAF event log.

Example fields:

- `totalRequests`
- `allowedRequests`
- `blockedRequests`
- `blockRate`
- `labels`
- `recentEvents`

### `GET /waf/events`

Returns recent raw JSON log entries recorded by the WAF.

### `GET /waf/evaluation`

Returns the latest offline model evaluation summary from `results/evaluation-summary.json`.

### `GET /waf/benchmark`

Returns the latest runtime benchmark summary from `results/runtime-benchmark.json`.

### `GET /waf/benchmark-report`

Returns the Markdown benchmark summary from `results/runtime-benchmark.md`.

### `POST /waf/classify`

Classifies a synthetic request payload without forwarding it to the backend.

Example request body:

```json
{
  "method": "GET",
  "url": "/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E",
  "headers": {
    "user-agent": "demo-client"
  },
  "body": ""
}
```

### `GET /dashboard`

Serves the interactive dashboard UI.

## Proxied application traffic

Any path other than the WAF control routes is inspected first. If the request is considered safe, it is forwarded to the backend application. If it is suspicious, the WAF returns `403` with a structured explanation.

## Response behavior

Allowed traffic:

- HTTP status `200`
- Forwarded to backend
- Includes WAF headers such as `x-waf-decision`, `x-waf-label`, and `x-waf-confidence`

Blocked traffic:

- HTTP status `403`
- JSON body includes predicted attack class, confidence, matched rules, and feature explanation

