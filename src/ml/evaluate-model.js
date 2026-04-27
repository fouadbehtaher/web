const fs = require("fs");
const path = require("path");
const { buildRequestRecord } = require("../common/request-utils");
const { extractTokens } = require("./feature-extractor");
const { trainMulticlassNaiveBayes } = require("./naive-bayes");
const { decideRequest } = require("../waf/decision-engine");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const DATASET_PATH = path.join(ROOT_DIR, "data", "training-samples.json");
const RESULT_PATH = path.join(ROOT_DIR, "results", "evaluation-summary.json");

function shuffleDeterministic(array) {
  const clone = [...array];
  let seed = 471;

  function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
}

function stratifiedSplit(samples) {
  const grouped = {};
  samples.forEach((sample) => {
    grouped[sample.label] = grouped[sample.label] || [];
    grouped[sample.label].push(sample);
  });

  const train = [];
  const test = [];

  Object.values(grouped).forEach((group) => {
    const shuffled = shuffleDeterministic(group);
    const testSize = Math.max(1, Math.round(group.length * 0.2));
    test.push(...shuffled.slice(0, testSize));
    train.push(...shuffled.slice(testSize));
  });

  return { train, test };
}

function toBinaryLabel(label) {
  return label === "benign" ? "benign" : "malicious";
}

function precisionRecallF1(tp, fp, fn) {
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return {
    precision: Number(precision.toFixed(4)),
    recall: Number(recall.toFixed(4)),
    f1: Number(f1.toFixed(4))
  };
}

function main() {
  const rawSamples = JSON.parse(fs.readFileSync(DATASET_PATH, "utf8"));
  const samples = rawSamples.map((sample) => {
    const record = buildRequestRecord(sample);
    return {
      id: sample.id,
      label: sample.label,
      record,
      tokens: extractTokens(record)
    };
  });

  const { train, test } = stratifiedSplit(samples);
  const model = trainMulticlassNaiveBayes(train);
  const confusionMatrix = {};
  let exactMatches = 0;
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  test.forEach((sample) => {
    const prediction = decideRequest(model, sample.record);
    const actual = sample.label;
    const predicted = prediction.finalLabel;

    confusionMatrix[actual] = confusionMatrix[actual] || {};
    confusionMatrix[actual][predicted] = (confusionMatrix[actual][predicted] || 0) + 1;

    if (actual === predicted) {
      exactMatches += 1;
    }

    const actualBinary = toBinaryLabel(actual);
    const predictedBinary = toBinaryLabel(predicted);

    if (actualBinary === "malicious" && predictedBinary === "malicious") {
      tp += 1;
    } else if (actualBinary === "benign" && predictedBinary === "benign") {
      tn += 1;
    } else if (actualBinary === "benign" && predictedBinary === "malicious") {
      fp += 1;
    } else {
      fn += 1;
    }
  });

  const metrics = precisionRecallF1(tp, fp, fn);
  const summary = {
    evaluatedAt: new Date().toISOString(),
    trainingSamples: train.length,
    testSamples: test.length,
    multiclassAccuracy: Number((exactMatches / test.length).toFixed(4)),
    binaryDetection: {
      accuracy: Number(((tp + tn) / test.length).toFixed(4)),
      falsePositiveRate: Number((fp / Math.max(1, fp + tn)).toFixed(4)),
      falseNegativeRate: Number((fn / Math.max(1, fn + tp)).toFixed(4)),
      ...metrics
    },
    confusionMatrix
  };

  fs.mkdirSync(path.dirname(RESULT_PATH), { recursive: true });
  fs.writeFileSync(RESULT_PATH, JSON.stringify(summary, null, 2));

  console.log("Evaluation completed.");
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  RESULT_PATH
};
