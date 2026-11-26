# Model comparison: baseline vs retrained

Baseline = `models/trained-model.baseline.json` (trained on the original 44 samples).
Retrained = `models/trained-model.json` (136 samples: 52 benign and 84 malicious). The original 44 samples (12 benign, 32 malicious) plus 92 synthetic ones added for this retrain: 40 benign and 52 malicious (12 in the first batch and 40 more in the second).

## Problem found

The baseline model blocked ordinary requests that had a query string but no `User-Agent` or `Accept` header, for example `/products?id=5&sort=price` (malicious probability 0.86). All 12 benign training samples carried browser-style headers, so the model learned that a header-less request with a query string looks malicious.

## Regression set (`npm run evaluate:regression`)

`data/holdout-samples.json` (the file name is historical): 40 benign and 40 malicious requests, not used for training. They were looked at while the training data was being revised, so this is a regression check and NOT an independent holdout estimate.

| Model | False positives | Detection (full decision) | Detection (model only) |
| --- | --- | --- | --- |
| Baseline | 12 of 40 (30%) | 38 of 40 (95%) | 95% |
| Retrained | 1 of 40 (2.5%) | 38 of 40 (95%) | 95% |

Missed by both: `hm9` (a JSON body containing a quote-based tautology) and `hm27` (a plain `/etc/passwd` path in a query value). The one retrained false positive is `hb27`, `/api/prices?currency=egp&date=2026-05-10`. The hard block rules are unchanged.

## Cross-validation on the training data (`npm run cross-validate`)

5-fold stratified, deterministic: false positive rate 11.5% (6 of 52 benign), false negative rate 4.8% (4 of 84 malicious). This is the more cautious number.

## Limits

- The 92 added training samples and the 80 holdout samples are synthetic and were written for this project. They are not real traffic.
- The first retrain (benign samples only) lowered false positives to 0 but cut detection on this set to 85%. The second batch of 40 malicious samples was added after seeing that, so the set influenced the data. It is not independent.
- The sample counts are small. Treat the percentages as indications. The existing `npm run evaluate` single split tests 26 samples (10 benign) and reports a 50% false positive rate. The cross-validation figure (11.5%) is the better guide, but the model still blocks a meaningful share of benign requests. Do not optimise further to these small sets.
- `results/evaluation-summary.json` has been regenerated for the 136-sample dataset: accuracy 0.81, false positive rate 0.50 (5 of 10 benign test requests), false negative rate 0. Its test set is small, so it is noisy, but it is the current figure and is reported as is. The earlier 1.00 accuracy came from the original 44-sample split (10 test samples, 2 benign) and is kept only as history in `results/evaluation-summary.baseline.json`.
- A real deployment needs real labelled traffic.
