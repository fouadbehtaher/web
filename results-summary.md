# Results Summary

## Offline evaluation

The latest offline evaluation is stored in `results/evaluation-summary.json`. Current results (regenerated with the retrained model):

- dataset: 136 samples (52 benign, 84 malicious); deterministic 80/20 split, 110 train / 26 test (10 benign, 16 malicious)
- accuracy: `0.81`
- precision: `0.76`
- recall: `1.00`
- F1-score: `0.86`
- false positive rate: `0.50` (5 of 10 benign test requests blocked)
- false negative rate: `0.00`

This single split has only 10 benign test samples, so the false positive rate is noisy. A 5-fold cross-validation on the same data (`results/cross-validation.json`) gives a false positive rate of 0.12 (6 of 52 benign) and a false negative rate of 0.05 (4 of 84 malicious). `results/model-comparison.md` compares the retrained model with the baseline on a separate regression set. The dataset is synthetic and small, so these are prototype figures and not a production guarantee.

An earlier run on the original 44-sample dataset (dated 2026-03-21, 34 train / 10 test with 2 benign) reported accuracy 1.00 and false positive rate 0.00. That figure is kept only as history in `results/evaluation-summary.baseline.json`. It is not a current result.

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

1. The prototype detects the prepared attack samples well, but it also blocks some benign requests (see the false positive figures above). It works on a small synthetic dataset and scripted demo scenarios.
2. The system is explainable because the block decision includes matched rules and influential tokens.
3. The dataset is limited and controlled, so broader testing is needed for stronger claims.
4. The hybrid design is one of the project strengths because it combines adaptability with explicit policy enforcement.
