# Presentation Speaking Notes

## 1. Opening

Good morning. My project is titled `Design and Implementation of an AI-Based Web Application Firewall`.

The main idea of this project is to improve web application protection by combining traditional WAF behavior with machine learning-based HTTP request analysis.

## 2. Problem

Web applications are among the most common targets for cyberattacks because they directly accept user input over HTTP. Traditional Web Application Firewalls are useful, but many of them rely heavily on predefined rules and signatures. This means they work well for known attacks, but they are less adaptable when attackers modify payloads or use obfuscation techniques.

## 3. Aim

The aim of my project was to build a prototype AI-Based WAF that can inspect incoming HTTP requests, classify suspicious traffic, and decide whether to allow or block each request before it reaches the application.

## 4. Why this topic matters

This topic is important because web attacks such as SQL injection, XSS, path traversal, and command injection are still common. At the same time, security systems need to become more adaptive. This project shows how AI can support that goal in a practical and explainable way.

## 5. System overview

My implementation contains a backend demo application, a reverse-proxy WAF gateway, a preprocessing and feature extraction layer, a multiclass Naive Bayes classifier, a hard-block rule engine, and a live dashboard for monitoring and demonstration.

## 6. Implementation choice

The final implementation was built in `Node.js`. This was partly due to the available environment, but it also made the project fully self-contained and easy to run. I implemented the classifier logic, feature extraction, logging, evaluation, and dashboard without relying on external machine learning services.

## 7. Attack classes

The prototype focuses on four main attack classes:

1. SQL injection
2. Cross-site scripting
3. Path traversal
4. Command injection

I selected these because they are well-known, meaningful, and suitable for clear demonstration in a graduation project.

## 8. Hybrid design

One important design decision was to use a hybrid model instead of ML only. The system uses machine learning to estimate class probabilities, but it also uses explicit rules to hard-block obviously dangerous payloads. This improves realism, trust, and explainability.

## 9. Dataset and features

I prepared a controlled labeled dataset of benign and malicious HTTP request samples. From each request, the system extracts features such as method, URL length, suspicious characters, encoded sequences, SQL patterns, XSS markers, traversal patterns, and command-related indicators.

## 10. Evaluation

I evaluated the system in two ways:

1. Offline evaluation using a labeled train/test split.
2. Runtime benchmark and live demo scenarios through the WAF itself.

The current offline evaluation results are very strong on the controlled dataset, and the runtime benchmark shows low latency in the test environment.

## 11. Live dashboard

I also developed a dashboard that shows service status, traffic statistics, recent WAF events, evaluation results, benchmark results, and an interactive request lab. This makes the project easier to explain and more convincing in a live demonstration.

## 12. Limitations

This is still a prototype. The dataset is limited and controlled, the backend is a demo application, and the results should not be interpreted as production-scale guarantees. However, for a graduation project, the system is technically complete, measurable, and explainable.

## 13. Conclusion

In conclusion, the project successfully demonstrates that AI can strengthen web application protection when combined with traditional WAF logic in a hybrid design. The system is practical, observable, and suitable for academic evaluation.

## 14. Closing

Thank you. I am ready for the demo and any questions.

