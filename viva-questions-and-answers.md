# Viva Questions and Answers

## 1. Why did you choose this topic?

I chose this topic because web applications are constantly exposed to cyberattacks, and traditional WAF solutions often rely on static rules. I wanted to explore how artificial intelligence can improve detection capability and adaptability in a practical cybersecurity application.

## 2. What is a Web Application Firewall?

A Web Application Firewall is a security layer that inspects HTTP traffic between users and a web application. Its purpose is to detect and block malicious requests before they reach the server.

## 3. What is the difference between a traditional WAF and your proposed system?

A traditional WAF mainly depends on predefined signatures and manually written rules. My proposed system adds a machine learning model that analyzes request patterns and helps detect suspicious traffic even when the payload is modified or not exactly matched by an existing rule.

## 4. Why did you use machine learning?

I used machine learning because attackers often change the form of their payloads to bypass static rules. A trained model can learn patterns from data and improve adaptability when classifying suspicious requests.

## 5. What attacks does your system focus on?

The prototype focuses on SQL injection, cross-site scripting, command injection, and path traversal because they are common, important, and suitable for demonstration in an academic project.

## 6. Why did you limit the scope to a few attack classes?

I limited the scope to keep the project realistic, measurable, and implementable within the available time. It is better to evaluate a smaller set of attacks properly than to make unrealistic claims about full protection.

## 7. What features can be extracted from HTTP requests?

Examples include request method, URL length, number of parameters, suspicious characters, SQL-related keywords, script-related content, encoded traversal patterns, and unusual headers.

## 8. What model would you use and why?

A lightweight model such as Logistic Regression or Random Forest is a good choice for this project because it is easier to train, evaluate, and explain. For a graduation project, explainability and feasibility are as important as accuracy.

## 9. How will you evaluate the system?

I will evaluate it using accuracy, precision, recall, F1-score, false positive rate, false negative rate, and response latency. This provides both security and performance perspectives.

## 10. What is a false positive in your project?

A false positive happens when the system classifies a legitimate request as malicious and blocks or flags it incorrectly.

## 11. What is a false negative?

A false negative happens when the system fails to detect a malicious request and allows it to pass through.

## 12. What are the limitations of your project?

The main limitations are restricted dataset realism, limited attack coverage, and the fact that this is a prototype rather than a production-grade enterprise firewall.

## 13. Can AI completely replace traditional WAF rules?

No. In practice, a hybrid approach is usually better. Traditional rules are still useful for known attacks and clear policy enforcement, while AI improves adaptability and pattern recognition.

## 14. Why is latency important in a WAF?

Because the WAF sits in front of the application, every request passes through it. If detection takes too long, it can reduce system performance and harm user experience.

## 15. What would you improve in future work?

I would use more realistic datasets, test sequence-based deep learning models, add explainable AI techniques, and integrate automatic rule generation or periodic retraining.

