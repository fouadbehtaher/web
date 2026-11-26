// Deterministic 5-fold stratified cross-validation over data/training-samples.json.
// Every sample is tested once by a model that did not see it. Usage: node src/ml/cross-validate.js
const path = require("path");
const { buildRequestRecord } = require("../common/request-utils");
const { extractTokens } = require("./feature-extractor");
const { trainMulticlassNaiveBayes } = require("./naive-bayes");
const { decideRequest } = require("../waf/decision-engine");

const FOLDS = 5;
const samples = require(path.resolve(__dirname, "..", "..", "data", "training-samples.json"));

function main() {
  const byLabel = {};
  samples.forEach((sample) => {
    (byLabel[sample.label] = byLabel[sample.label] || []).push(sample);
  });

  let benign = 0;
  let malicious = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  for (let fold = 0; fold < FOLDS; fold += 1) {
    const train = [];
    const test = [];
    Object.values(byLabel).forEach((group) =>
      group.forEach((sample, index) => (index % FOLDS === fold ? test : train).push(sample))
    );
    const model = trainMulticlassNaiveBayes(
      train.map((sample) => ({ label: sample.label, tokens: extractTokens(buildRequestRecord(sample)) }))
    );
    test.forEach((sample) => {
      const blocked = decideRequest(model, buildRequestRecord(sample)).action === "block";
      if (sample.label === "benign") {
        benign += 1;
        if (blocked) falsePositives += 1;
      } else {
        malicious += 1;
        if (!blocked) falseNegatives += 1;
      }
    });
  }

  const summary = {
    folds: FOLDS,
    benign,
    malicious,
    falsePositiveRate: Number((falsePositives / benign).toFixed(4)),
    falseNegativeRate: Number((falseNegatives / malicious).toFixed(4))
  };
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

if (require.main === module) {
  main();
}

module.exports = { main };
