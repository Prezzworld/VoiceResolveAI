const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dns = require("dns")
const webhookRoutes = require("./routes/webhookRoutes");
require("dotenv").config();

const ledgerRoutes = require("./routes/ledgerRoutes")

dns.setServers(["8.8.8.8", "8.8.4.4"])

const app = express()

app.use(express.json())
app.use(cors())

app.use("/voiceResolveAI/api/v1/ledger", ledgerRoutes);
app.use("/voiceResolveAI/api/v1/webhook", webhookRoutes);

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI).then(() => console.log("MongoDB conected successfully")).catch((err) => console.error("MongoDB connection error: ", err))

app.get("/", (req, res) => {
  res.send("VoiceResolve AI Backend is running...")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})