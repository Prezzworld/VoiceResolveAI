require("dotenv").config()
const WebSocket = require("ws")
const fs = require("fs")

const apiKey = process.env.SAHARA_API_KEY

const transcribeAudio = (audioBuffer) => {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(
      "wss://infer.voice.intron.io/stt/v1/stream?sample_rate=16000&bit_rate=16&num_channels=1&use_language_asr_input=en",
      {headers: {Authorization: `Bearer ${apiKey}`}}
    );

    socket.on("message", (data) => {
      const msg = JSON.parse(data)
      if(msg.message_type === "SESSION_CREATED") {
        let position = 0
        const chunkSize = 24000
        let id = 1

        while (position < audioBuffer.length) {
          const chunk = audioBuffer.subarray(
            position,
            Math.min(position + chunkSize, audioBuffer.length),
          );

          const inputChunk = {
            message_type: "INPUT_AUDIO_CHUNK",
            audio_base_64: chunk.toString("base64"),
            ack_id: id++,
          };

          socket.send(JSON.stringify(inputChunk));
          position += chunkSize;
        }
        socket.send(JSON.stringify({ message_type: "COMMIT" }));
      }

      if(msg.message_type === "COMMITTED_TRANSCRIPT") {
        resolve(msg.transcript_text)
      }

      if (
        msg.message_type === "INPUT_ERROR" ||
        msg.message_type === "AUTHENTICATION_ERROR" ||
        msg.message_type === "ERROR"
      ) {
        reject(new Error(msg.message));
      }
    })

    socket.on("error", (err) => {
      reject(err)
    })
  })
}

module.exports = {transcribeAudio}