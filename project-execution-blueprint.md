# Project Execution Blueprint

## Recommended stack

- Language: `Python`
- Gateway/API layer: `FastAPI`
- ML library: `scikit-learn`
- Model candidates: Logistic Regression, Random Forest, or XGBoost if available
- Logging: structured JSON logs
- Demo application: simple vulnerable or intentionally testable web app in a safe local environment

## Recommended architecture

1. Client sends HTTP request.
2. WAF gateway intercepts request.
3. Preprocessing module normalizes input.
4. Feature extractor converts request to structured features.
5. AI model predicts benign or malicious.
6. Decision engine allows, blocks, or logs the request.
7. Dashboard or log viewer displays results.

## Recommended milestones

1. Build a simple request capture proxy.
2. Create a labeled dataset from safe local test traffic and public samples.
3. Train a baseline classifier.
4. Integrate the model with live request handling.
5. Measure false positives, false negatives, and latency.
6. Write up results and limitations honestly.

## Practical scope advice

- Do not try to detect every attack type.
- Focus on 3 to 4 common attacks and evaluate them well.
- Prefer a lightweight, explainable model over a very complex model if the dataset is small.
- Keep the prototype reproducible and easy to demonstrate.

## Good project title variants

- AI-Based Web Application Firewall
- Intelligent Web Application Firewall Using Machine Learning
- Design and Implementation of an AI-Driven Web Application Firewall

## Short viva explanation

This project builds a smart protection layer in front of a web application. Instead of relying only on static rules, it uses machine learning to analyze incoming HTTP requests and identify malicious patterns such as SQL injection and XSS. The goal is to improve adaptability and detection performance while keeping the prototype lightweight and practical.
