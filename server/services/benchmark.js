require("dotenv").config();
const fs = require("fs")

const transcribeWithWhisper = async (audioPath) => {
  const formData = new FormData()
  formData.append("file", new Blob([fs.readFileSync(audioPath)]), "audio.wav")
  formData.append("model", "whisper-1")
 
  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    },
  );

  const data = await response.json();
  return data.text;
}

const transcribeWithAssemblyAI = async (audioPath) => {
  const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: { Authorization: process.env.ASSEMBLYAI_API_KEY },
    body: fs.readFileSync(audioPath),
  });
  const { upload_url } = await uploadResponse.json();

  const transcriptResponse = await fetch(
    "https://api.assemblyai.com/v2/transcript",
    {
      method: "POST",
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audio_url: upload_url }),
    },
  );
  const { id } = await transcriptResponse.json();

  let attempts = 0
  const maxAttempts = 20
  while (attempts < maxAttempts) {
    const statusResponse = await fetch(
      `https://api.assemblyai.com/v2/transcript/${id}`,
      {
        headers: { Authorization: process.env.ASSEMBLYAI_API_KEY },
      },
    );
    const statusData = await statusResponse.json();

    if (statusData.status === "completed") {
      return statusData.text;
    }
    if (statusData.status === "error") {
      throw new Error(statusData.error);
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  throw new Error("AssemblyAI transcription timed out");
}

module.exports = { transcribeWithWhisper, transcribeWithAssemblyAI }