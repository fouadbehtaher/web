# Model comparison: baseline vs retrained

Baseline = `models/trained-model.baseline.json` (trained on the original 44 samples).
Retrained = `models/trained-model.json` (136 samples: the original 44 plus 92 synthetic ones).

## Problem found

The baseline model blocked ordinary requests that had a query string but no `User-Agent` or `Accept` header, for example `/products?id=5&sort=price` (malicious probability 0.86). All 12 benign training samples carried browser-style headers, so the model learned that a header-less request with a query string looks malicious.

## Held-out evaluation (`npm run evaluate:holdout`)

`data/holdout-samples.json`: 40 benign and 40 malicious requests, never used for training.

| Model | False positives | Detection (full decision) | Detection (model only) |
| --- | --- | --- | --- |
| Baseline | 12 of 40 (30%) | 38 of 40 (95%) | 95% |
| Retrained | 1 of 40 (2.5%) | 38 of 40 (95%) | 95% |

Missed by both: `hm9` (a JSON body containing a quote-based tautology) and `hm27` (a plain `/etc/passwd` path in a query value). The one retrained false positive is `hb27`, `/api/prices?currency=egp&date=2026-05-10`. The hard block rules are unchanged.

## Cross-validation on the training data (`node src/ml/cross-validate.js`)

5-fold stratified, deterministic: false positive rate 11.5% (6 of 52 benign), false negative rate 4.8% (4 of 84 malicious). This is the more cautious number.

## Limits

- The 92 added training samples and the 80 holdout samples are synthetic and were written for this project. They are not real traffic.
- The holdout set was looked at once before the second batch of malicious training samples was added (the first retrain lowered false positives but cut detection to 85%). It is a regression check, not an unbiased estimate.
- The sample counts are small. Treat the percentages as indications. The existing `npm run evaluate` single split now tests 26 samples and reports a high false positive rate (about 50%) on its 10 benign samples. That is the same small-sample noise, and the cross-validation above is the better guide.
- `results/evaluation-summary.json` (and the accuracy figure quoted in `results-summary.md` and the final report) was produced by the original 44-sample split with 10 test samples. It describes the baseline dataset and was not regenerated. Re-running `npm run evaluate` on the larger dataset gives the less flattering numbers above.
- A real deployment needs real labelled traffic.
