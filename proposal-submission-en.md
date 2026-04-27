# Submission-Ready Proposal Text

## Student name(s)

FouadTaherFouad

## Title for the project

AI-Based Web Application Firewall

## Initial description for the problem

Web applications are exposed to many cyberattacks, including SQL injection, cross-site scripting, command injection, path traversal, and malicious automated requests. Traditional Web Application Firewalls mainly depend on static rules and signatures to detect attacks. While this approach is useful for known threats, it is less effective against new, modified, or obfuscated payloads. It can also generate false positives and require frequent manual tuning.

As web attacks continue to evolve, rule-based protection alone is often insufficient. There is a need for a more adaptive solution that can learn patterns from HTTP traffic and distinguish malicious requests from legitimate ones with better accuracy while maintaining acceptable performance.

## Initial description for the suggested solution

This project proposes an AI-Based Web Application Firewall that combines traditional filtering with machine learning-based traffic analysis. The system will inspect incoming HTTP requests before they reach the web application, extract relevant features from request components, and classify them as benign or malicious using an AI model.

The prototype will focus on detecting common attacks such as SQL injection, XSS, command injection, and path traversal. The project will include data preparation, model training, prototype implementation, and evaluation using metrics such as accuracy, precision, recall, F1-score, false positive rate, and response latency. The expected outcome is a practical prototype that demonstrates how AI can improve web application protection beyond static rule-based approaches.
