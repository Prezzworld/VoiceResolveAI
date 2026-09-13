require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { calculateWER } = require("../services/wer");

const results = require("./results.json");

results.forEach((entry) => {
  const saharaWER = calculateWER(entry.groundTruth, entry.sahara);
  const assemblyWER = calculateWER(entry.groundTruth, entry.assemblyai);

  console.log(`\n${entry.clip}:`);
  console.log(`  Sahara WER: ${saharaWER.toFixed(3)}`);
  console.log(`  AssemblyAI WER: ${assemblyWER.toFixed(3)}`);
});