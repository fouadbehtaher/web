# Design and Implementation of an AI-Based Web Application Firewall

## Abstract

Web applications remain one of the most exposed components in modern digital systems because they continuously process user-supplied data over public networks. This makes them attractive targets for attacks such as SQL injection, cross-site scripting, command injection, and path traversal. Traditional Web Application Firewalls are widely used to filter malicious traffic, but most of them rely heavily on static rules and signature-based detection. Although effective for known threats, these approaches often struggle against obfuscated payloads, new attack variants, and traffic patterns that differ from predefined signatures. This limitation motivates the need for more adaptive protection methods.

This project presents the design and implementation of an AI-Based Web Application Firewall that combines conventional request inspection with machine learning-based malicious request classification. The proposed system operates as an intermediary layer in front of a protected web application. It captures incoming HTTP requests, preprocesses them, extracts meaningful lexical and structural features, and uses a trained classification model to determine whether a request should be allowed, logged, or blocked. The prototype focuses on representative application-layer attacks such as SQL injection, XSS, command injection, and path traversal.

The project is intended as an academic prototype rather than a production-grade enterprise firewall. Its contribution lies in demonstrating that AI techniques can strengthen web application protection by improving adaptability and reducing exclusive dependence on static rule sets. The solution is evaluated using standard metrics such as accuracy, precision, recall, F1-score, false positive rate, and request latency. The expected result is a practical and explainable prototype that shows how machine learning can support next-generation web application defense.

## Chapter 1: Introduction

### 1.1 Background

Web applications play a central role in e-commerce, education, healthcare, government, and cloud services. Because they are directly exposed to end users through the Internet, they are frequently targeted by attackers seeking unauthorized access, service disruption, credential theft, or data exfiltration. Public-facing applications are especially vulnerable when they process untrusted input without strict validation or when they expose weak points in authentication, session handling, file access, or database interaction.

The application layer presents unique security challenges because malicious activity may appear similar to legitimate usage. A request containing a SQL payload, a JavaScript fragment, or encoded traversal sequences can be embedded within otherwise normal HTTP traffic. This makes application-layer security more difficult than simple packet-level filtering. Traditional network firewalls are not sufficient because they do not inspect the semantic content of application requests in enough depth.

To address this issue, organizations commonly deploy Web Application Firewalls. A WAF acts as a filtering layer that examines HTTP requests and responses and blocks suspicious behavior according to a set of policies. However, many rule-based WAFs still require extensive tuning and maintenance. They may miss novel or obfuscated attacks and may also generate false positives when legitimate traffic matches a suspicious pattern.

### 1.2 Problem Statement

The central problem of this project is that traditional rule-based WAF systems are limited in their ability to adapt to evolving web attacks. Static signatures are effective for known attack templates, but attackers regularly modify payloads using encoding, character manipulation, parameter pollution, or alternate syntactic forms. In such cases, a purely rule-driven approach can become brittle. At the same time, expanding the rule base may increase complexity, maintenance cost, and false positive rates.

This creates a practical need for a more adaptive protection mechanism that can learn request patterns and support more intelligent decision making. The challenge is to introduce machine learning into the traffic analysis process without making the system too complex, too slow, or too difficult to evaluate in an academic setting.

### 1.3 Aim

The aim of this project is to design, implement, and evaluate a prototype AI-Based Web Application Firewall capable of analyzing HTTP requests and detecting malicious traffic more adaptively than a purely rule-based approach.

### 1.4 Objectives

1. Study common web application attacks and their impact on modern systems.
2. Review traditional WAF technologies and identify their main limitations.
3. Design a preprocessing and feature extraction pipeline for HTTP request analysis.
4. Build and evaluate a machine learning model for malicious request detection.
5. Implement a prototype WAF layer that can allow, block, and log requests.
6. Measure the system in terms of both security effectiveness and runtime overhead.

### 1.5 Scope

This project focuses on a prototype-level WAF for academic evaluation. It targets HTTP request inspection at the application layer and concentrates on a limited but important set of web attacks, including SQL injection, XSS, command injection, and path traversal. The project does not claim to replace enterprise WAF products, zero-trust platforms, network intrusion detection systems, or full security operations workflows.

The prototype is designed for a controlled environment in which labeled malicious and benign requests can be analyzed, classified, and replayed for testing. The system is evaluated primarily on detection quality and practicality rather than production deployment readiness.

### 1.6 Significance of the Project

The significance of this project lies in its practical and educational value. From a technical perspective, it demonstrates how AI can be integrated into a web security control that is traditionally dominated by signatures and hand-written rules. From an academic perspective, it provides a clear case study that combines cybersecurity, machine learning, systems design, and experimental evaluation in a single graduation project.

### 1.7 Report Structure

This report is organized as follows. Chapter 2 reviews the relevant literature on web application attacks, traditional WAF systems, and AI-based security approaches. Chapter 3 presents the requirements and analysis of the proposed system. Chapter 4 explains the system architecture and design decisions. Chapter 5 outlines the implementation strategy and evaluation plan. Chapter 6 discusses expected results and limitations. Chapter 7 concludes the work and proposes future enhancements.

## Chapter 2: Literature Review

### 2.1 Web Application Threat Landscape

Web applications face a broad range of threats because they expose input interfaces, authentication functions, database access paths, file operations, and business logic over standard web protocols. OWASP identifies injection-related flaws, misconfiguration, broken access control, and other issues as major web application risks. Injection remains especially important because malicious input can alter the intended interpretation of commands, queries, or documents.

SQL injection is one of the best-known examples of input-driven exploitation. It occurs when untrusted input is used to construct database queries in an unsafe manner. Successful exploitation can expose sensitive information, modify stored data, or bypass authentication. XSS is another major class of attacks in which untrusted input is reflected or stored in a way that allows malicious scripts to execute in the victim’s browser. Path traversal manipulates file path references to reach files outside the intended directory structure, while command injection abuses unsafe use of operating system commands by the application.

These attack categories remain relevant because they are conceptually simple, highly reusable, and often adaptable through obfuscation. Even when direct exploitation becomes harder due to secure frameworks, attackers continue to automate reconnaissance and send diverse malicious payloads at scale.

### 2.2 Traditional Web Application Firewalls

Traditional WAFs operate as reverse proxies, embedded modules, or cloud security layers positioned between clients and applications. Their main function is to inspect HTTP requests and apply policies that decide whether traffic should be allowed, blocked, challenged, or logged. Open-source solutions such as ModSecurity popularized the use of rule-based inspection driven by signature matching and scoring mechanisms.

Rule-based WAFs remain valuable because they are interpretable, controllable, and effective against known attack patterns. Security administrators can define explicit behaviors and map detections to recognizable rules. However, this strength is also a limitation. New payload variants may evade existing patterns, while overly broad rules can trigger false positives on legitimate traffic. As the number of rules grows, system tuning becomes more labor-intensive.

The literature therefore suggests that traditional WAFs are necessary but not always sufficient for modern attack conditions. They are especially challenged by polymorphic payloads, encoding tricks, and adversarial behavior that changes faster than manual rule engineering can keep up with.

### 2.3 AI and Machine Learning in Web Security

Machine learning offers an alternative or complementary approach by learning patterns from data rather than depending entirely on manually written signatures. In cybersecurity, ML methods have been applied to spam detection, malware classification, intrusion detection, anomaly detection, phishing detection, and malicious URL analysis. For web request security, machine learning can treat HTTP content as structured data or as a sequence of tokens and characters.

The key promise of ML-based request analysis is adaptability. Instead of checking only whether a known pattern exists, a trained model can evaluate combinations of features such as request length, token frequency, character distribution, suspicious keywords, encoding anomalies, and parameter structure. This makes ML attractive for identifying attacks that are not exact matches to known rules.

At the same time, ML introduces its own challenges. Detection quality depends on data quality, class balance, feature representation, and model selection. Poorly curated datasets can produce misleading accuracy. Highly complex models may also increase latency and reduce explainability. Therefore, many practical systems benefit from a hybrid design in which rules and machine learning complement one another.

### 2.4 Related Work

Recent studies show continued interest in combining WAF technologies with learning-based approaches. Research on deep-learning-enabled WAFs demonstrates that learned models can identify malicious requests based on HTTP content and extracted features. Other work, such as ModSec-Learn, explores how machine learning can strengthen established rule-based systems rather than replace them completely. This reflects an important design insight: rule engines and ML classifiers can be combined to improve overall resilience.

The literature also highlights a recurring difficulty: access to realistic datasets. Many public datasets for malicious HTTP traffic come from controlled environments and may not fully capture the diversity of production traffic. More recent work has emphasized the importance of real-world blocked request datasets and automated traffic generation frameworks for benchmarking web attack detection systems.

These findings support the direction of this project. A realistic academic prototype should avoid claiming universal protection. Instead, it should focus on a clearly defined threat set, use a transparent feature pipeline, evaluate performance honestly, and show how AI can add value in a practical WAF workflow.

### 2.5 Research Gap

The reviewed literature suggests a gap between academic demonstrations and practical deployable prototypes. Some studies focus heavily on model performance but provide limited system design detail. Others describe WAF architectures without sufficiently evaluating ML behavior under realistic request flows. This project addresses that gap by combining a simple but implementable architecture with measurable evaluation criteria and a clearly limited scope.

## Chapter 3: Requirements and Analysis

### 3.1 Functional Requirements

The proposed AI-Based WAF must:

1. Intercept incoming HTTP requests before they reach the protected application.
2. Parse core request fields including method, path, query parameters, headers, and payload.
3. Preprocess and normalize relevant input fields.
4. Extract features required for classification.
5. Classify requests as benign or malicious.
6. Block or allow traffic based on the classification result.
7. Log the request, model decision, and action taken.
8. Support evaluation using previously collected or labeled test traffic.

### 3.2 Non-Functional Requirements

The system should:

1. Introduce only moderate latency.
2. Be modular and easy to extend.
3. Produce repeatable results under the same inputs.
4. Be easy to demonstrate in an academic setting.
5. Offer enough transparency to explain decisions during evaluation.

### 3.3 Threat Model

The assumed attacker is an external client sending crafted HTTP requests to the public-facing application. The attacker can manipulate URLs, query strings, headers, form parameters, and request bodies. The attacker may also use encoding, payload fragmentation, and automated scanning tools to test different attack variants. The system does not assume insider compromise, application source code tampering, or complete host compromise before request inspection.

### 3.4 Constraints

Several practical constraints shape the project design. First, large-scale real production traffic is usually unavailable because of privacy and access restrictions. Second, the project timeline limits the number of attack classes and model types that can be evaluated thoroughly. Third, deploying a highly complex deep-learning model may introduce unnecessary complexity for a graduation project. These constraints support the choice of a scoped prototype with explainable features and a lightweight classifier.

### 3.5 Feasibility Analysis

The project is technically feasible because the main building blocks are well understood: HTTP request capture, request parsing, feature engineering, classification, and policy enforcement. Open-source tools and libraries can support each stage. The main feasibility decision is therefore not whether the project can be built, but how to keep it academically rigorous and practically manageable. A hybrid and scoped design satisfies both needs.

## Chapter 4: System Design

### 4.1 High-Level Architecture

The system follows a layered architecture:

1. Client sends an HTTP request.
2. WAF gateway receives the request.
3. Preprocessing module normalizes input.
4. Feature extraction module builds a structured representation.
5. ML classifier produces a benign or malicious prediction.
6. Decision engine applies a policy to allow, block, or log.
7. Logging module records the event.
8. Safe requests are forwarded to the protected application.

### 4.2 Input Processing

The preprocessing stage standardizes the request to reduce inconsistency. It may decode URL-encoded content, normalize case where appropriate, remove redundant separators, and tokenize suspicious strings. This is important because malicious payloads often exploit alternative encodings or small syntactic changes to bypass pattern matching.

### 4.3 Feature Extraction

Features may include:

- Request method
- URL length
- Number of parameters
- Count of special characters
- Presence of SQL-related tokens
- Presence of script-related tokens
- Suspicious directory traversal sequences
- Shell metacharacters
- Header anomalies
- Encoded character patterns

The choice of features should balance usefulness and simplicity. A feature set that is too narrow may miss attacks, while an overly complex feature set may be harder to explain and maintain.

### 4.4 Model Selection

For this prototype, lightweight supervised models such as Logistic Regression, Random Forest, or similar classifiers are appropriate starting points. They are practical, easier to train on modest datasets, and often easier to evaluate than deep neural networks in a limited-scope academic project. If a more advanced model is tested, it should be compared against a simpler baseline rather than presented in isolation.

### 4.5 Decision Logic

The decision engine receives the classification score and applies a security policy. Requests with high malicious confidence may be blocked immediately. Borderline cases may be logged for review or combined with simple rules for extra confidence. This supports a hybrid strategy in which rules remain useful as a first line of defense while the AI component improves adaptability.

### 4.6 Logging and Monitoring

Every inspected request should generate a log entry containing key metadata such as timestamp, source address if available, request path, predicted class, confidence score, and final action. Logging supports evaluation, tuning, and explanation of the prototype’s behavior.

## Chapter 5: Implementation and Evaluation Plan

### 5.1 Proposed Tools

The recommended implementation stack is Python with FastAPI or Flask for the gateway layer and scikit-learn for model development. This stack is lightweight, widely supported, and suitable for prototyping. A simple demonstration web application can be placed behind the WAF to show real request interception and decision enforcement.

### 5.2 Data Preparation

The dataset can be assembled from a mix of controlled malicious samples, public benchmark-style data, and locally generated benign requests. Each request should be labeled and converted into a consistent format. Data cleaning should remove duplicates where necessary, normalize fields, and ensure that class labels reflect the intended evaluation scenario.

### 5.3 Training and Testing

The data should be divided into training and testing sets, with optional validation for parameter tuning. More than one model can be tested, but the evaluation should emphasize clarity rather than excessive model experimentation. A strong graduation project result is not just high accuracy, but also a credible explanation of why the chosen model works and what its limitations are.

### 5.4 Evaluation Metrics

Accuracy alone is not enough in security classification because datasets may be imbalanced. Therefore, the evaluation should also report precision, recall, F1-score, false positive rate, and false negative rate. Latency should be measured to estimate the overhead introduced by the WAF gateway and the classifier.

### 5.5 Test Scenarios

The prototype should be tested using:

1. Benign requests that simulate ordinary application use.
2. Clear malicious payloads for each selected attack class.
3. Slightly obfuscated malicious variants.
4. Borderline cases that are difficult to classify.

This helps show whether the system generalizes beyond exact training examples.

### 5.6 Expected Outcomes

The expected outcome is not perfect protection, but a convincing demonstration that the ML-assisted WAF can detect representative malicious requests with useful accuracy and acceptable performance. The system should also reveal where errors occur, especially false positives and false negatives, so that future improvements can be justified.

## Chapter 6: Discussion, Limitations, and Future Work

### 6.1 Discussion

If the prototype performs well, the main conclusion will be that AI can improve the adaptability of web request inspection when used in a carefully scoped way. The most valuable result is not simply the prediction score, but the combination of detection quality, low complexity, and explainable design.

### 6.2 Limitations

The project has several expected limitations. Public datasets may not fully represent production traffic. Attackers may craft payloads specifically to evade the learned model. A lightweight feature-based classifier may also miss deeper semantic relationships in complex requests. In addition, a limited-scope prototype cannot cover the full diversity of API abuse, authentication attacks, business logic flaws, or advanced adversarial behavior.

### 6.3 Future Work

Future improvements may include:

1. Online learning or periodic model retraining.
2. Use of sequence-based or transformer-based request models.
3. Explainable AI techniques for decision transparency.
4. Integration with rule-learning pipelines.
5. Broader dataset coverage using more realistic traffic sources.
6. Deployment experiments in containerized or cloud-native environments.

## Chapter 7: Conclusion

This project proposes a practical academic approach to improving web application protection through an AI-Based Web Application Firewall. By combining request preprocessing, feature extraction, machine learning classification, and policy-based enforcement, the system aims to provide more adaptive defense than static rules alone. The design intentionally balances innovation with feasibility by limiting scope, choosing understandable components, and emphasizing measurable evaluation.

The project contributes a prototype-centered perspective: rather than claiming full replacement of existing WAF solutions, it demonstrates how AI can strengthen request filtering in a controlled and explainable way. This makes the project suitable as a graduation topic that integrates cybersecurity, software engineering, and machine learning into a coherent and evaluable system.

## Suggested References

Use the reference list in [references-starter.md](c:\Users\tamat\OneDrive\Desktop\AI-Based Web Application Firewall\references-starter.md) as the starting bibliography for the final report.

