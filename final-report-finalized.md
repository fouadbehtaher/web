# Final Report

AOU

CyberSecurity

TM471

## Project Title

Design and Implementation of an AI-Based Web Application Firewall

## Submitted By

FouadTaherFouad

## Student ID

23510848

## Supervisor / Tutor

HebaShief

## Submission Date

March 21, 2026

## Academic Year

2025-2026

---PAGEBREAK---

## Project Title

Design and Implementation of an AI-Based Web Application Firewall

## Student Name

FouadTaherFouad

## Abstract

Web applications remain one of the most exposed attack surfaces in modern information systems because they continuously process untrusted input through publicly accessible interfaces. Although traditional Web Application Firewalls provide an important protection layer, most of them rely primarily on static signatures and manually maintained rules. This limits their ability to respond effectively to obfuscated payloads, modified exploit patterns, and previously unseen attack variants. This project addresses that limitation through the design and implementation of an AI-Based Web Application Firewall that combines machine learning-based HTTP request classification with explicit high-risk blocking rules.

The implemented prototype was developed in Node.js and deployed as a reverse-proxy gateway in front of a protected backend application. Incoming requests are normalized, transformed into structured security features, evaluated by a multiclass Naive Bayes classifier, and then passed through a hybrid decision engine that determines whether each request should be allowed or blocked. The prototype focuses on four representative attack classes: SQL injection, cross-site scripting, path traversal, and command injection. To improve observability and demonstration quality, the system also includes structured logging, evaluation scripts, benchmark tooling, and an interactive dashboard for runtime inspection.

The system was evaluated using a controlled labeled dataset and scripted benchmark scenarios. In the current prototype environment, the hybrid WAF achieved strong offline classification results and low runtime overhead while maintaining explainable decision outputs. These findings do not imply production-level completeness; however, they demonstrate that AI techniques can be integrated into application-layer traffic inspection in a compact, understandable, and academically defensible way.

## Keywords

Web Application Firewall, Machine Learning, Cybersecurity, HTTP Request Classification, SQL Injection, Cross-Site Scripting, Path Traversal, Command Injection

## Chapter 1: Introduction

### 1.1 Background

Web applications now support critical functions across education, business, healthcare, government, and cloud services. Because they expose input-driven functionality directly over HTTP and HTTPS, they are continuously accessible not only to legitimate users but also to automated scanners, opportunistic attackers, and targeted adversaries. This makes the application layer a primary security boundary rather than a secondary concern.

Unlike lower-layer network attacks, many web application attacks are embedded inside syntactically valid application traffic. Malicious payloads can be delivered through URLs, query strings, headers, forms, and JSON bodies while still appearing superficially similar to ordinary requests. As a result, simple packet filtering is insufficient. Effective defense requires request-aware inspection that can reason about suspicious content, abnormal structure, and known exploit behavior before the request reaches the protected application.

Among the most significant and demonstrable application-layer threats are SQL injection, cross-site scripting, path traversal, and command injection. These attacks remain important because they are conceptually simple, easy to automate, and capable of producing serious outcomes such as authentication bypass, database leakage, browser-side code execution, sensitive file exposure, and system-level compromise.

### 1.2 Problem Statement

Traditional WAF solutions depend strongly on static rules and signature matching. This approach is effective for well-known attack templates, but it becomes less reliable when adversaries alter payload structure, apply encoding tricks, distribute malicious fragments across parameters, or use variants that do not exactly match the expected signature. At the same time, increasingly broad rule sets may create operational overhead and raise the probability of false positives by misclassifying legitimate traffic that appears unusual.

The practical problem, therefore, is not whether rule-based WAFs are useful, but whether they are sufficient on their own in a changing threat environment. This project assumes they are not. A more adaptive inspection mechanism is needed, one that can learn request patterns from data while still preserving transparency, controllability, and acceptable runtime cost.

### 1.3 Aim

The aim of this project is to design, implement, and evaluate a prototype AI-Based Web Application Firewall that can inspect HTTP requests and identify malicious web traffic more adaptively than a purely rule-based solution.

### 1.4 Objectives

1. Review important web application attack classes and WAF limitations.
2. Design a preprocessing and feature extraction pipeline for HTTP requests.
3. Train an ML model to classify malicious and benign traffic.
4. Implement a hybrid WAF gateway that combines ML and explicit rules.
5. Provide observable runtime behavior through logs, metrics, and a dashboard.
6. Evaluate both detection effectiveness and runtime overhead.

## Chapter 2: Literature Review

Web application security guidance from OWASP highlights injection-style vulnerabilities, broken access control, and insecure request handling as major application-layer concerns. SQL injection, XSS, command injection, and path traversal remain especially suitable for an academic WAF project because they are well-known, practical, and observable in HTTP traffic.

Traditional WAF systems such as ModSecurity and OWASP CRS use explicit pattern matching and policy enforcement. Their strength is transparency and operational control, but their weakness is limited adaptability. Research in AI-based WAF systems shows that machine learning can support better generalization by learning token, structure, and character-level patterns from request data. Recent work such as ModSec-Learn also suggests that hybrid designs are more realistic than trying to replace rule engines completely.

The main gap addressed by this project is the need for a practical, explainable prototype that integrates model inference, rule-based blocking, observable runtime behavior, and measurable evaluation in one coherent system.

## Chapter 3: Requirements and Analysis

### 3.1 Functional Requirements

The implemented prototype must:

1. Intercept incoming HTTP requests.
2. Parse request method, URL, headers, and body.
3. Normalize the request content before analysis.
4. Extract useful security features.
5. Classify traffic into benign or attack-related categories.
6. Allow safe traffic and block suspicious traffic.
7. Log runtime decisions for later analysis.
8. Support standalone classification for demo and testing purposes.

### 3.2 Non-Functional Requirements

The prototype should:

1. Remain easy to run on a standard machine.
2. Be explainable during a viva or supervisor review.
3. Introduce limited request overhead.
4. Produce repeatable, deterministic evaluation outputs.
5. Remain small enough to understand fully in a graduation-project timeframe.

### 3.3 Project Constraints

The environment available for implementation did not include Python, so the final system was implemented entirely in Node.js. This constraint influenced the design positively by encouraging a fully self-contained solution with no external ML dependency. The dataset is controlled and moderate in size, which improves reproducibility but limits how far results can be generalized.

## Chapter 4: System Design

### 4.1 High-Level Architecture

The final architecture contains the following components:

1. A backend demo application.
2. A WAF reverse-proxy gateway.
3. A preprocessing and normalization stage.
4. A feature extraction module.
5. A multiclass Naive Bayes classifier.
6. A hard-block rule engine for high-risk payloads.
7. A decision engine that combines rule and ML output.
8. Logging, metrics, and dashboard components.

The architecture diagram for the project is available in `architecture-diagram.mmd`.

### 4.2 Data Flow

When a request arrives at the WAF gateway, it is first converted into a structured record containing the method, path, query string, headers, and body. The text is normalized and tokenized so that suspicious elements can be represented consistently. The feature extractor then generates tokens such as request method, content length buckets, suspicious encoding patterns, SQL-specific markers, XSS markers, traversal sequences, and command-related symbols. The trained model uses these features to estimate class probabilities.

In parallel, a small set of explicit rules checks for high-confidence attack signatures such as `UNION SELECT`, `<script>`, traversal markers like `../`, and command-chaining patterns. The decision engine combines these inputs to make a final decision. Safe requests are forwarded to the backend application, while blocked requests receive a `403` response with an explanation payload.

### 4.3 Selected Model

The project uses a multiclass Naive Bayes classifier. This was chosen because it is simple, transparent, computationally light, and easy to implement from scratch. For a graduation project, this is a suitable trade-off between feasibility and meaningful machine learning integration. The system does not depend on black-box hosted inference or heavy external ML frameworks.

## Chapter 5: Implementation

### 5.1 Technology Stack

The final implementation uses:

- `Node.js` runtime
- built-in `http` module for networking
- JSON-based labeled dataset
- a self-contained Naive Bayes implementation
- a custom feature extractor
- a browser dashboard using plain HTML, CSS, and JavaScript

### 5.2 Main Files

The key implementation files are:

- `src/ml/feature-extractor.js`
- `src/ml/naive-bayes.js`
- `src/ml/train-model.js`
- `src/ml/evaluate-model.js`
- `src/waf/decision-engine.js`
- `src/waf/server.js`
- `src/backend/server.js`
- `src/demo/run-demo.js`
- `src/demo/run-benchmark.js`

### 5.3 Dataset

The training data is stored in `data/training-samples.json` and contains labeled benign and malicious HTTP request samples. The dataset covers the following classes:

- `benign`
- `sql_injection`
- `xss`
- `path_traversal`
- `command_injection`

The dataset includes both query-based and body-based examples so that the WAF can inspect realistic request shapes such as login forms, search queries, download endpoints, and diagnostic tools.

### 5.4 Feature Engineering

The feature extractor includes:

- method tokens such as `METHOD_GET` and `METHOD_POST`
- query and body presence markers
- content-length buckets
- special-character count buckets
- SQL indicators such as tautologies and schema access patterns
- XSS indicators such as script tags and event handlers
- traversal tokens such as `../` and encoded traversal strings
- command-execution markers such as shell chaining and suspicious command keywords

This feature design intentionally keeps the system understandable and defendable in an academic context.

### 5.5 Hybrid Decision Logic

The decision engine combines two ideas:

1. ML probability estimation for learned pattern recognition.
2. explicit blocking rules for obviously dangerous payloads.

This hybrid structure is one of the strongest aspects of the project because it avoids relying only on ML confidence and also avoids relying only on fixed signatures.

### 5.6 Dashboard and Observability

An interactive dashboard was added at `GET /dashboard`. It shows:

- total traffic volume
- blocked and allowed counts
- runtime label distribution
- recent events
- offline evaluation metrics
- runtime benchmark summary
- an interactive request classification lab

The request lab allows a user to submit a synthetic request and receive a classification result without forwarding traffic to the backend. This is useful during demonstrations and viva discussions.

## Chapter 6: Testing and Evaluation

### 6.1 Offline Evaluation

The offline evaluation script reads the labeled dataset, performs a deterministic stratified split, trains the model on the training subset, and evaluates the hybrid decision logic on the test subset. The resulting summary is stored in `results/evaluation-summary.json`.

At the current stage of the project, the recorded offline metrics are:

- accuracy: `1.00`
- precision: `1.00`
- recall: `1.00`
- F1-score: `1.00`
- false positive rate: `0.00`
- false negative rate: `0.00`

These values are strong, but they must be interpreted in the correct context: the dataset is curated, limited in size, and designed for a graduation-project prototype rather than for production benchmarking.

### 6.2 Runtime Demonstration

The `run-demo` script starts the backend and WAF, then sends both benign and malicious requests. The observed behavior is:

- benign product traffic is forwarded successfully,
- SQL injection attempts are blocked,
- XSS attempts are blocked,
- path traversal attempts are blocked,
- command injection attempts are blocked.

This confirms that the end-to-end system behavior matches the intended security design.

### 6.3 Runtime Benchmark

The benchmark script generates repeated requests across the main traffic categories and measures latency through the WAF. The latest benchmark result is stored in `results/runtime-benchmark.json` and `results/runtime-benchmark.md`.

The most recent benchmark values are:

- total measured requests: `44`
- overall average latency: `2.682 ms`
- benign traffic average latency: `7.28 ms`
- SQL injection average latency: `0.872 ms`
- XSS average latency: `0.937 ms`
- path traversal average latency: `1.064 ms`
- command injection average latency: `0.959 ms`

The benign path is slower in this benchmark because allowed traffic is forwarded to the backend application, while blocked traffic is rejected immediately by the WAF.

### 6.4 Explainability

The project supports explainability in two ways:

1. blocked responses include matched rules and influential features,
2. runtime events are stored in a structured JSON log.

This makes the system easier to justify academically and easier to demonstrate live.

## Chapter 7: Discussion

The completed prototype shows that a compact AI-assisted WAF can be implemented in a fully self-contained way while still remaining understandable and measurable. The use of a simple model is not a weakness in this context. Instead, it strengthens the project by making the system transparent, reproducible, and realistic for the available scope.

The most important engineering decision was to use a hybrid security approach. A rule-only system would be easier to build but less adaptive. An ML-only system would be more difficult to trust and explain. The hybrid design gives the project both academic value and practical credibility.

The addition of the dashboard, metrics endpoints, and interactive request lab also improves the quality of the final demonstration. It turns the project from a static classification script into a live security system that can be observed and defended in front of examiners.

## Chapter 8: Limitations and Future Work

### 8.1 Limitations

The project still has important limitations:

1. The dataset is small and controlled.
2. The evaluation environment does not represent internet-scale production traffic.
3. The current feature set is intentionally lightweight.
4. The model has not been tested against adversarial evasion strategies.
5. The backend application is a demo service, not a real production workload.

### 8.2 Future Work

Useful future extensions include:

1. larger and more realistic HTTP traffic datasets,
2. comparison against additional ML models,
3. sequence-based request modeling,
4. automatic rule generation from learned patterns,
5. deployment in containers or cloud environments,
6. richer dashboards with charts and historical aggregation.

## Chapter 9: Conclusion

This project successfully delivered a working AI-Based Web Application Firewall prototype that integrates HTTP request inspection, machine learning-based classification, explicit rule enforcement, runtime logging, offline evaluation, benchmarking, and live dashboard visibility within one coherent system. The final implementation is technically functional, operationally demonstrable, and academically defensible for a graduation-project context.

The main contribution of the project is not merely the use of machine learning, but the way it is combined with traditional security logic in a hybrid design. The resulting system is able to inspect requests, explain blocking decisions, measure runtime behavior, and present results in a form suitable for both technical evaluation and academic discussion. This makes the prototype more credible than a purely conceptual design or a classifier tested in isolation.

Although the system is intentionally limited in scope and does not claim enterprise-grade completeness, it clearly demonstrates the central thesis of the project: AI can strengthen web request inspection when integrated carefully into a practical WAF architecture. For that reason, the project serves as a strong example of how cybersecurity and machine learning can be combined in a concrete, explainable, and measurable application.


## References

[1] OWASP Foundation, "OWASP Top Ten Web Application Security Risks," 2025. [Online]. Available: https://owasp.org/www-project-top-ten/. [Accessed: Mar. 21, 2026].

[2] OWASP Foundation, "SQL Injection," OWASP Community. [Online]. Available: https://owasp.org/www-community/attacks/SQL_Injection. [Accessed: Mar. 21, 2026].

[3] OWASP Foundation, "Cross Site Scripting (XSS)," OWASP Community. [Online]. Available: https://owasp.org/www-community/attacks/xss/. [Accessed: Mar. 21, 2026].

[4] OWASP Foundation, "Path Traversal," OWASP Community. [Online]. Available: https://owasp.org/www-community/attacks/Path_Traversal. [Accessed: Mar. 21, 2026].

[5] OWASP Foundation, "Command Injection," OWASP Community. [Online]. Available: https://owasp.org/www-community/attacks/Command_Injection. [Accessed: Mar. 21, 2026].

[6] OWASP Foundation, "OWASP Core Rule Set (CRS)," OWASP Project. [Online]. Available: https://owasp.org/www-project-modsecurity-core-rule-set/. [Accessed: Mar. 21, 2026].

[7] C. Scano, G. Floris, B. Montaruli, L. Demetrio, A. Valenza, L. Compagna, D. Ariu, L. Piras, D. Balzarotti, and B. Biggio, "ModSec-Learn: Boosting ModSecurity with Machine Learning," arXiv preprint arXiv:2406.13547, 2024. [Online]. Available: https://arxiv.org/abs/2406.13547. [Accessed: Mar. 21, 2026].

[8] S. Althubiti, E. Jones, and K. Roy, "Deep Learning Technique-Enabled Web Application Firewall for the Detection of Web Attacks," Sensors, vol. 23, no. 4, p. 2073, 2023, doi: 10.3390/s23042073.

[9] M. Kuhrer, C. Rossow, and T. Holz, "WebEye - Automated Collection of Malicious HTTP Traffic," arXiv preprint arXiv:1802.06012, 2018. [Online]. Available: https://arxiv.org/abs/1802.06012. [Accessed: Mar. 21, 2026].

[10] G. Lucz and B. Forstner, "A Thirty-Day Dataset of Malicious HTTP Requests Blocked by OWASP ModSecurity on a Production Web Server," Data, vol. 10, no. 11, p. 186, 2025, doi: 10.3390/data10110186.
