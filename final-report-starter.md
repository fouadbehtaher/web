# Final Report Starter

## Project Title

Design and Implementation of an AI-Based Web Application Firewall

## Abstract

Web applications are a major target for cyberattacks because they continuously receive user-generated input through publicly accessible interfaces. Traditional Web Application Firewalls provide an essential first line of defense, but they rely heavily on signatures and predefined rules, which limits their effectiveness against evolving or obfuscated attacks. This project presents the design and implementation of an AI-Based Web Application Firewall that combines conventional request filtering with machine learning-based classification of HTTP traffic. The proposed system analyzes incoming requests, extracts relevant features, and predicts whether the traffic is benign or malicious before forwarding it to the protected application. The prototype focuses on detecting representative attacks such as SQL injection, cross-site scripting, command injection, and path traversal. The system is evaluated using standard performance and security metrics including accuracy, precision, recall, F1-score, false positive rate, and latency. The project aims to demonstrate that AI techniques can improve adaptive threat detection while keeping the solution practical and suitable for an academic prototype.

## Aim

To design, implement, and evaluate a prototype AI-Based Web Application Firewall capable of detecting malicious HTTP requests more adaptively than traditional rule-based approaches.

## Objectives

1. Study the security challenges faced by modern web applications.
2. Review traditional WAF mechanisms and their limitations.
3. Build a preprocessing pipeline for HTTP request analysis.
4. Extract meaningful features for malicious request detection.
5. Train and test a machine learning model on labeled traffic data.
6. Implement a prototype WAF gateway that sits in front of a sample web application.
7. Evaluate the system using both detection and performance metrics.

## Scope

The project focuses on a prototype-level WAF designed for academic evaluation rather than enterprise-scale deployment. It targets application-layer web attacks carried through HTTP requests and does not attempt to replace complete network firewalls, endpoint protection, or full-scale security operations platforms. The main focus is intelligent request inspection and attack classification.

## Proposed Methodology

1. Review relevant literature on web attacks, WAF technologies, and AI-based cybersecurity.
2. Define system requirements and the threat model.
3. Collect or prepare labeled HTTP request data containing both benign and malicious samples.
4. Preprocess the traffic and extract useful lexical, structural, and statistical features.
5. Train one or more classification models and compare results.
6. Integrate the selected model into a prototype request-filtering gateway.
7. Test the system with representative attack scenarios and normal traffic.
8. Evaluate detection performance and runtime overhead.

## Functional Requirements

- Inspect incoming HTTP requests before forwarding them to the application.
- Extract features from request URL, headers, parameters, and payload.
- Classify traffic as benign or malicious.
- Log detection decisions and blocked requests.
- Allow the protected application to process safe requests normally.

## Non-Functional Requirements

- Maintain acceptable response latency.
- Provide consistent classification behavior.
- Support easy testing and demonstration.
- Be modular enough for future extension.

## Proposed System Components

- Reverse proxy or middleware inspection layer
- Request parser and feature extraction module
- ML classification engine
- Decision and blocking module
- Logging and monitoring module
- Sample protected web application

## Candidate Attack Classes

- SQL Injection
- Cross-Site Scripting
- Command Injection
- Path Traversal
- Malformed or suspicious input patterns

## Candidate Features

- Request method
- URL length
- Number of special characters
- Presence of SQL keywords
- Encoding anomalies
- Suspicious script tags or shell tokens
- Parameter count and structure
- Header irregularities

## Evaluation Metrics

- Accuracy
- Precision
- Recall
- F1-score
- False positive rate
- False negative rate
- Average response latency

## Project Deliverables

- Literature review
- System design and architecture
- Trained AI model
- Working prototype WAF
- Test dataset or prepared evaluation set
- Experimental results and analysis
- Final report and presentation

## Risks and Mitigation

- Limited dataset quality: mitigate by combining public and controlled local samples.
- High false positives: mitigate by feature tuning and threshold adjustment.
- Model complexity affecting speed: mitigate by preferring lightweight models for the prototype.
- Scope expansion: mitigate by focusing on a limited set of well-defined attacks.

## Suggested Chapter Structure

### Chapter 1: Introduction

Background, motivation, aim, objectives, scope, and report organization.

### Chapter 2: Literature Review

Web security threats, WAF technologies, AI in cybersecurity, and related work.

### Chapter 3: Analysis and Requirements

Threat model, system requirements, constraints, and design considerations.

### Chapter 4: System Design

Architecture, data flow, feature extraction, model selection, and decision process.

### Chapter 5: Implementation

Tools, development environment, preprocessing, model training, and prototype implementation.

### Chapter 6: Testing and Evaluation

Test scenarios, datasets, metrics, findings, and discussion.

### Chapter 7: Conclusion and Future Work

Summary, limitations, recommendations, and possible improvements.

## Suggested Timeline

1. Weeks 1-2: topic refinement and literature review
2. Weeks 3-4: requirements and system design
3. Weeks 5-7: dataset preparation and preprocessing
4. Weeks 8-10: model development and experimentation
5. Weeks 11-12: prototype integration
6. Weeks 13-14: testing and evaluation
7. Weeks 15-16: report writing and final presentation preparation

