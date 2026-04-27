# Implementation Notes

## Prototype choices

- Runtime: `Node.js`
- Transport layer: built-in `http` module
- ML model: self-contained multiclass Naive Bayes classifier
- Protection mode: hybrid `ML + explicit rule checks`
- Dataset: controlled labeled HTTP samples stored in JSON

## Why this implementation is suitable for a graduation project

- It is fully runnable without Python or external ML libraries.
- The code is small enough to explain clearly in a viva.
- The hybrid design reflects real WAF thinking instead of relying on ML only.
- The outputs are reproducible because training samples, training logic, and evaluation scripts are all inside the project.

## Main workflow

1. Requests are received by the WAF gateway.
2. The request is normalized and converted to a structured record.
3. Feature tokens are extracted from URL, query string, headers, and body.
4. The trained Naive Bayes model estimates class probabilities.
5. The rule engine checks for obvious high-risk payloads.
6. The decision engine either forwards or blocks the request.
7. The event is logged for later analysis and dashboard display.

## Files to mention in the report

- `src/ml/feature-extractor.js`: feature engineering logic
- `src/ml/naive-bayes.js`: training and prediction logic
- `src/waf/decision-engine.js`: hybrid security decision logic
- `src/waf/server.js`: runtime gateway and dashboard endpoints
- `src/backend/server.js`: protected demo backend
- `src/demo/run-demo.js`: end-to-end demonstration
- `src/demo/run-benchmark.js`: runtime benchmark generation

