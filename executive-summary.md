# Executive Summary

This project presents the design and implementation of an `AI-Based Web Application Firewall` that protects a backend web application by inspecting HTTP requests before they reach the server. The system combines a machine learning classifier with explicit hard-block security rules, creating a hybrid WAF design that is both adaptive and explainable.

Student name: `FouadTaherFouad`
Student ID: `23510848`
Supervisor: `HebaShief`

The implemented prototype was built entirely in `Node.js` and includes a reverse-proxy gateway, a custom feature extraction pipeline, a multiclass Naive Bayes classifier, runtime logging, offline evaluation scripts, benchmark tooling, and a live dashboard. The selected attack classes are `SQL injection`, `cross-site scripting`, `path traversal`, and `command injection`.

In the current controlled project environment, the prototype demonstrated strong offline detection performance and low runtime overhead. It also provides interpretable outputs through matched rules, feature explanations, structured logs, and an interactive request-testing interface. While the system is not intended as an enterprise-ready WAF, it successfully demonstrates that AI techniques can enhance application-layer traffic inspection in a compact and academically defensible way.

## One-Paragraph Version

This project develops a prototype AI-Based Web Application Firewall that combines machine learning and explicit security rules to inspect and block malicious HTTP requests before they reach a web application. Implemented in Node.js, the system includes a reverse-proxy gateway, a Naive Bayes classifier, a feature extraction pipeline, evaluation and benchmark tools, and a live dashboard for monitoring and interactive testing. The prototype focuses on SQL injection, XSS, path traversal, and command injection, and demonstrates that a hybrid AI-assisted WAF can be practical, explainable, and suitable for a graduation-project setting.
