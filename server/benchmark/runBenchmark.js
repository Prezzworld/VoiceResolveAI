require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { transcribeAudio } = require("../services/saharaService");
const { transcribeWithAssemblyAI } = require("../services/benchmark");
const groundTruth = require("../benchmark/audio/groundTruth.json");

const clips = ["igbo1", "igbo2", "pidgin1", "pidgin2"];

const runBenchmark = async () => {
  const results = [];

  for (const clipName of clips) {
    console.log(`\nProcessing ${clipName}...`);

    const wavPath = path.join(__dirname, `./audio/${clipName}.wav`);
    console.log("WAV path:", wavPath);
    const pcmPath = path.join(__dirname, `./audio/${clipName}.pcm`);
    console.log("PCM path:", pcmPath);

    const pcmBuffer = fs.readFileSync(pcmPath);

    console.log(
      "About to call transcribeAudio with buffer size:",
      pcmBuffer.length,
    );

    let saharaResult;
    try {
      saharaResult = await transcribeAudio(pcmBuffer);
      console.log("Sahara done");
    } catch (err) {
      console.error("Sahara call failed:", err);
      throw err;
    }

    let assemblyResult;
    try {
      assemblyResult = await transcribeWithAssemblyAI(wavPath);
      console.log("AssemblyAI done");
    } catch (err) {
      console.error("AssemblyAI call failed:", err);
      throw err;
    }

    results.push({
      clip: clipName,
      groundTruth: groundTruth[`${clipName}.wav`],
      sahara: saharaResult,
      assemblyai: assemblyResult,
    });
  }

  fs.writeFileSync(
    path.join(__dirname, "../benchmark/results.json"),
    JSON.stringify(results, null, 2),
  );
  console.log("\nAll done. Results saved to benchmark/results.json");
};

runBenchmark().catch((err) => {
  console.error("Benchmark failed:", err);
});