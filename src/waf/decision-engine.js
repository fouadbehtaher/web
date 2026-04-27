const { extractTokens, SIGNATURE_RULES } = require("../ml/feature-extractor");
const { explainPrediction, predictWithModel } = require("../ml/naive-bayes");
const { requestRecordToText } = require("../common/request-utils");
const { findMatchingPolicy } = require("./policy-store");

const HARD_BLOCK_RULES = [
  { id: "rule-sql-union", label: "sql_injection", pattern: /\bunion\b(?:[\s\S]{0,20})\bselect\b/i },
  { id: "rule-sql-drop", label: "sql_injection", pattern: /\bdrop\s+table\b|\bsleep\s*\(\s*\d+\s*\)/i },
  { id: "rule-script-tag", label: "xss", pattern: /<\s*script\b|%3cscript/i },
  { id: "rule-traversal", label: "path_traversal", pattern: /\.\.\/|\.\.\\|%2e%2e%2f|%252e%252e%252f/i },
  { id: "rule-command-chain", label: "command_injection", pattern: /(?:;\s*|&&\s*|\|\|\s*|\|\s*|`\s*)(?:cat|curl|wget|whoami|uname|powershell|cmd\.exe|bash|sh)\b/i }
];

function decideRequest(model, record) {
  const normalizedText = requestRecordToText(record);
  const tokens = extractTokens(record);
  const prediction = predictWithModel(model, tokens);
  const matchedPolicy = findMatchingPolicy(record);
  const matchedRules = HARD_BLOCK_RULES.filter((rule) => rule.pattern.test(normalizedText));

  if (matchedPolicy) {
    const finalLabel = matchedPolicy.action === "allow" ? "benign" : "manual_block";
    return {
      action: matchedPolicy.action,
      predictedLabel: finalLabel,
      finalLabel,
      maliciousProbability: matchedPolicy.action === "block" ? 1 : 0,
      probabilities: Object.fromEntries(
        Object.entries(prediction.probabilities).map(([label, value]) => [label, Number(value.toFixed(4))])
      ),
      explanation: [
        {
          token: `${matchedPolicy.field}:${matchedPolicy.operator}`,
          weight: 1
        }
      ],
      matchedRules: [],
      matchedFeatureRules: [],
      matchedPolicy,
      decisionSource: "manual-policy",
      tokenCount: tokens.length
    };
  }

  const maliciousByModel =
    prediction.topLabel !== "benign" && prediction.maliciousProbability >= 0.8;
  const maliciousByRule = matchedRules.length > 0;
  const predictedLabel = maliciousByRule ? matchedRules[0].label : prediction.topLabel;
  const action = maliciousByRule || maliciousByModel ? "block" : "allow";
  const finalLabel = action === "allow" ? "benign" : predictedLabel;

  const matchedFeatureRules = SIGNATURE_RULES.filter((rule) => rule.pattern.test(normalizedText)).map(
    (rule) => rule.token
  );

  return {
    action,
    predictedLabel,
    finalLabel,
    maliciousProbability: Number(prediction.maliciousProbability.toFixed(4)),
    probabilities: Object.fromEntries(
      Object.entries(prediction.probabilities).map(([label, value]) => [label, Number(value.toFixed(4))])
    ),
    explanation: explainPrediction(model, tokens, finalLabel === "benign" ? "benign" : predictedLabel),
    matchedRules: matchedRules.map((rule) => rule.id),
    matchedFeatureRules,
    matchedPolicy: null,
    decisionSource: maliciousByRule ? "rule+ml" : maliciousByModel ? "ml" : "allow",
    tokenCount: tokens.length
  };
}

module.exports = {
  decideRequest
};
