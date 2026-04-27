# Project Proposal Draft

## Student name(s)

FouadTaherFouad

## Title for the project

AI-Based Web Application Firewall

## Initial description for the problem

Web applications are among the most frequently targeted systems on the Internet because they are directly exposed to users and attackers through HTTP requests. Common attacks such as SQL injection, cross-site scripting (XSS), command injection, path traversal, and malicious automation can lead to data breaches, service disruption, and unauthorized access. To reduce these risks, organizations often deploy Web Application Firewalls (WAFs) that inspect traffic and block suspicious requests before they reach the application server.

However, most traditional WAF solutions depend mainly on static signatures, fixed rules, and manual configuration. Although these methods are effective for well-known attacks, they often fail to detect new, obfuscated, or slightly modified attack payloads. In addition, rigid rules can produce false positives by blocking legitimate traffic that appears unusual. This creates operational overhead, requires constant tuning, and reduces the overall efficiency of web application protection.

The main problem addressed in this project is the limitation of traditional rule-based WAF systems in identifying evolving attacks while maintaining acceptable accuracy and performance. Therefore, there is a need for a more adaptive and intelligent protection mechanism that can learn traffic patterns, identify malicious behavior more effectively, and improve decision making beyond static rule matching alone.

## Initial description for the suggested solution

This project proposes the design and implementation of an AI-Based Web Application Firewall that combines conventional request filtering with machine learning-based attack detection. The proposed system will operate as an intermediary security layer in front of a web application. Incoming HTTP requests will be collected and preprocessed, and relevant features will be extracted from elements such as URLs, query strings, headers, request methods, body content, payload length, encoding patterns, and suspicious character sequences.

After preprocessing, the requests will be analyzed using an AI or machine learning model trained to classify traffic as benign or malicious. The solution may also include a lightweight rule-based layer for baseline filtering so that the system benefits from both known-pattern detection and adaptive analysis. The prototype will focus on detecting representative web attacks such as SQL injection, XSS, command injection, and path traversal.

The project output will include a working prototype WAF gateway, a traffic dataset preparation process, an attack classification model, and an evaluation framework. The system will be assessed using security and performance metrics such as accuracy, precision, recall, F1-score, false positive rate, and response latency. The expected result is a practical prototype that demonstrates how AI techniques can enhance web application defense by improving detection capability and reducing dependence on static rules only.

## Optional short objectives

1. Analyze common web application attacks and the weaknesses of traditional WAF systems.
2. Design a traffic inspection pipeline for parsing and preprocessing HTTP requests.
3. Extract useful features from requests for attack classification.
4. Train and evaluate a machine learning model for malicious request detection.
5. Implement a prototype AI-based WAF in front of a sample web application.
6. Measure the effectiveness and overhead of the proposed solution.

## Optional tools and technologies

- Python with FastAPI or Flask for the prototype gateway
- A sample vulnerable or test web application for demonstration
- Scikit-learn, TensorFlow, or PyTorch for model development
- Public benchmark data or controlled locally generated HTTP traffic
- Logging, alerting, and simple dashboard or reporting components
