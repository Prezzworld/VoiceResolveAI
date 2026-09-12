const mongoose = require("mongoose")

const transactionSchema = mongoose.Schema({
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  accountBalance: { type: Number, required: true, default: 0 },
  transactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  senderBank: { type: String, required: true },
  destinationBank: { type: String, required: true },
  status: {
    type: String,
    enum: ["FAILED", "SUCCESSFUL", "REFUNDED"],
    default: "FAILED",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema)