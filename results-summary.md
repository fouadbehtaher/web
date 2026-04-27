# Results Summary

## Offline evaluation

The latest offline evaluation is stored in `results/evaluation-summary.json`. In the current controlled dataset split, the hybrid WAF achieved the following results:

- accuracy: `1.00`
- precision: `1.00`
- recall: `1.00`
- F1-score: `1.00`
- false positive rate: `0.00`
- false negative rate: `0.00`

This result should be reported honestly as a prototype outcome on a small curated dataset, not as a production guarantee.

## Runtime behavior

The demo confirms the expected operational flow:

- benign traffic is forwarded to the backend,
- SQL injection attempts are blocked,
- XSS attempts are blocked,
- path traversal attempts are blocked,
- command injection attempts are blocked.

The latest runtime benchmark is stored in `results/runtime-benchmark.json` and `results/runtime-benchmark.md`. In the current benchmark run:

- total measured requests: `44`
- overall average latency: `2.682 ms`
- benign traffic average latency: `7.28 ms`
- SQL injection average latency: `0.872 ms`
- XSS average latency: `0.937 ms`
- path traversal average latency: `1.064 ms`
- command injection average latency: `0.959 ms`

## Reporting guidance

In the final report, it is good practice to emphasize:

1. The prototype performs well on the prepared dataset and scripted demo scenarios.
2. The system is explainable because the block decision includes matched rules and influential tokens.
3. The dataset is limited and controlled, so broader testing is needed for stronger claims.
4. The hybrid design is one of the project strengths because it combines adaptability with explicit policy enforcement.
