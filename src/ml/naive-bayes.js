function incrementCounter(map, key, amount = 1) {
  map[key] = (map[key] || 0) + amount;
}

function countTokens(tokens) {
  const counts = {};
  tokens.forEach((token) => incrementCounter(counts, token));
  return counts;
}

function trainMulticlassNaiveBayes(examples) {
  const labelDocumentCounts = {};
  const labelTokenCounts = {};
  const labelTotalTokens = {};
  const vocabulary = new Set();

  examples.forEach((example) => {
    const label = example.label;
    labelDocumentCounts[label] = (labelDocumentCounts[label] || 0) + 1;
    labelTokenCounts[label] = labelTokenCounts[label] || {};
    labelTotalTokens[label] = labelTotalTokens[label] || 0;

    example.tokens.forEach((token) => {
      vocabulary.add(token);
      incrementCounter(labelTokenCounts[label], token);
      labelTotalTokens[label] += 1;
    });
  });

  return {
    generatedAt: new Date().toISOString(),
    totalDocuments: examples.length,
    labels: Object.keys(labelDocumentCounts),
    labelDocumentCounts,
    labelTokenCounts,
    labelTotalTokens,
    vocabulary: Array.from(vocabulary),
    vocabularySize: vocabulary.size
  };
}

function predictWithModel(model, tokens) {
  const tokenCounts = countTokens(tokens);
  const totalDocuments = model.totalDocuments;
  const labelCount = model.labels.length;
  const vocabularySize = model.vocabularySize;
  const logScores = {};

  model.labels.forEach((label) => {
    const prior = (model.labelDocumentCounts[label] + 1) / (totalDocuments + labelCount);
    let score = Math.log(prior);
    const totalTokensForLabel = model.labelTotalTokens[label] + vocabularySize;
    const labelCounts = model.labelTokenCounts[label];

    Object.entries(tokenCounts).forEach(([token, count]) => {
      const tokenProbability = ((labelCounts[token] || 0) + 1) / totalTokensForLabel;
      score += count * Math.log(tokenProbability);
    });

    logScores[label] = score;
  });

  const maxLogScore = Math.max(...Object.values(logScores));
  const exponentiated = {};
  let total = 0;

  Object.entries(logScores).forEach(([label, score]) => {
    const value = Math.exp(score - maxLogScore);
    exponentiated[label] = value;
    total += value;
  });

  const probabilities = {};
  Object.entries(exponentiated).forEach(([label, value]) => {
    probabilities[label] = value / total;
  });

  const rankedLabels = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);
  const topLabel = rankedLabels[0][0];
  const maliciousProbability = 1 - (probabilities.benign || 0);

  return {
    topLabel,
    probabilities,
    maliciousProbability,
    rankedLabels
  };
}

function explainPrediction(model, tokens, predictedLabel, baselineLabel = "benign") {
  const uniqueTokens = Array.from(new Set(tokens));
  const vocabularySize = model.vocabularySize;
  const targetCounts = model.labelTokenCounts[predictedLabel] || {};
  const baselineCounts = model.labelTokenCounts[baselineLabel] || {};
  const targetTotal = (model.labelTotalTokens[predictedLabel] || 0) + vocabularySize;
  const baselineTotal = (model.labelTotalTokens[baselineLabel] || 0) + vocabularySize;

  return uniqueTokens
    .map((token) => {
      const targetScore = Math.log(((targetCounts[token] || 0) + 1) / targetTotal);
      const baselineScore = Math.log(((baselineCounts[token] || 0) + 1) / baselineTotal);
      return {
        token,
        weight: Number((targetScore - baselineScore).toFixed(4))
      };
    })
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);
}

module.exports = {
  explainPrediction,
  predictWithModel,
  trainMulticlassNaiveBayes
};

