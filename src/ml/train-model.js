const fs = require("fs");
const path = require("path");
const { buildRequestRecord } = require("../common/request-utils");
const { extractTokens } = require("./feature-extractor");
const { trainMulticlassNaiveBayes } = require("./naive-bayes");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const DATASET_PATH = path.join(ROOT_DIR, "data", "training-samples.json");
const MODEL_PATH = path.join(ROOT_DIR, "models", "trained-model.json");

function loadExamples() {
  const raw = JSON.parse(fs.readFileSync(DATASET_PATH, "utf8"));
  return raw.map((sample) => {
    const record = buildRequestRecord(sample);
    return {
      id: sample.id,
      label: sample.label,
      description: sample.description,
      tokens: extractTokens(record)
    };
  });
}

function main() {
  const examples = loadExamples();
  const model = trainMulticlassNaiveBayes(examples);

  fs.mkdirSync(path.dirname(MODEL_PATH), { recursive: true });
  fs.writeFileSync(MODEL_PATH, JSON.stringify(model, null, 2));

  console.log("Training completed.");
  console.log(`Samples: ${examples.length}`);
  console.log(`Labels: ${model.labels.join(", ")}`);
  console.log(`Vocabulary size: ${model.vocabularySize}`);
  console.log(`Model saved to: ${MODEL_PATH}`);
  return model;
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  loadExamples,
  MODEL_PATH
};
