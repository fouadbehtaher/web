// Evaluates one or more trained models on data/holdout-samples.json.
// The holdout samples are never used for training. Usage:
//   node src/ml/evaluate-holdout.js [model.json ...]
// With no arguments it evaluates models/trained-model.json.
const fs = require("fs");
const path = require("path");
const { buildRequestRecord } = require("../common/request-utils");
const { extractTokens } = require("./feature-extractor");
const { predictWithModel } = require("./naive-bayes");
const { decideRequest } = require("../waf/decision-engine");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const HOLDOUT_PATH = path.join(ROOT_DIR, "data", "holdout-samples.json");

function evaluate(modelPath, samples) {
  const model = JSON.parse(fs.readFileSync(modelPath, "utf8"));
  const stats = { benign: 0, malicious: 0, falsePositives: 0, missedFull: 0, missedMlOnly: 0 };
  const falsePositiveIds = [];
  const missedIds = [];

  samples.forEach((sample) => {
    const record = buildRequestRecord(sample);
    const isBenign = sample.label === "benign";
    const full = decideRequest(model, record);
    const prediction = predictWithModel(model, extractTokens(record));
    const mlBlocks = prediction.topLabel !== "benign" && prediction.maliciousProbability >= 0.8;

    if (isBenign) {
      stats.benign += 1;
      if (full.action === "block") {
        stats.falsePositives += 1;
        falsePositiveIds.push(sample.id);
      }
    } else {
      stats.malicious += 1;
      if (full.action !== "block") {
        stats.missedFull += 1;
        missedIds.push(sample.id);
      }
      if (!mlBlocks) {
        stats.missedMlOnly += 1;
      }
    }
  });

  return {
    model: path.relative(ROOT_DIR, modelPath),
    benignSamples: stats.benign,
    maliciousSamples: stats.malicious,
    falsePositiveRate: Number((stats.falsePositives / stats.benign).toFixed(4)),
    falsePositives: stats.falsePositives,
    detectionRateFullDecision: Number((1 - stats.missedFull / stats.malicious).toFixed(4)),
    detectionRateModelOnly: Number((1 - stats.missedMlOnly / stats.malicious).toFixed(4)),
    falsePositiveIds,
    missedIds
  };
}

function main() {
  const samples = JSON.parse(fs.readFileSync(HOLDOUT_PATH, "utf8"));
  const args = process.argv.slice(2);
  const models = args.length ? args : [path.join(ROOT_DIR, "models", "trained-model.json")];
  const results = models.map((modelPath) => evaluate(path.resolve(modelPath), samples));
  console.log(JSON.stringify(results, null, 2));
  return results;
}

if (require.main === module) {
  main();
}

module.exports = { evaluate, main };
