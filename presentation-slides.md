# Presentation Slides

## Slide 1: Title

Design and Implementation of an AI-Based Web Application Firewall

- Student name: FouadTaherFouad
- Course: TM471
- Supervisor: HebaShief

## Slide 2: Problem Statement

- Web applications are frequent targets of cyberattacks
- Common attacks include SQL injection, XSS, command injection, and path traversal
- Traditional WAFs rely heavily on fixed rules and signatures
- Static rules may miss new or obfuscated attacks and may create false positives

## Slide 3: Project Aim

- Build a prototype AI-Based Web Application Firewall
- Detect malicious HTTP requests before they reach the web application
- Combine traditional filtering with machine learning-based classification

## Slide 4: Objectives

- Study common web attacks
- Review limitations of traditional WAF systems
- Extract features from HTTP requests
- Train a malicious request classifier
- Implement a working WAF prototype
- Evaluate security effectiveness and latency

## Slide 5: Why AI in WAF?

- Learns patterns from traffic data
- Can detect variations of known attacks
- Reduces full dependence on manually written signatures
- Supports adaptive security decisions

## Slide 6: Proposed Architecture

- Client
- AI-based WAF gateway
- Preprocessing and feature extraction
- ML classifier
- Decision engine: allow, block, log
- Protected web application

## Slide 7: Selected Attack Classes

- SQL Injection
- Cross-Site Scripting
- Command Injection
- Path Traversal

## Slide 8: Data and Features

- Request method
- URL and parameter structure
- Special characters and encoded patterns
- SQL keywords
- Script-related tokens
- Traversal and shell symbols
- Header anomalies

## Slide 9: Implementation Stack

- Python
- FastAPI or Flask
- scikit-learn
- Structured logging
- Local demo web application

## Slide 10: Evaluation Metrics

- Accuracy
- Precision
- Recall
- F1-score
- False positive rate
- Response latency

## Slide 11: Expected Contribution

- Practical prototype for intelligent request filtering
- Demonstration of AI support in web application defense
- Comparison between traditional and adaptive detection logic
- Clear academic evaluation with measurable outcomes

## Slide 12: Limitations and Future Work

- Prototype scope only
- Limited dataset realism
- Possible false positives or false negatives
- Future work: larger datasets, online learning, explainable AI

## Slide 13: Conclusion

- Web application attacks continue to evolve
- Static rule-based protection is valuable but limited
- AI can improve adaptability in request inspection
- The project offers a feasible and meaningful graduation prototype

## Slide 14: Questions

Thank you
