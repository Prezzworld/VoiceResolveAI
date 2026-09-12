const Transaction  = require("../models/transaction");
const fs = require("fs")
const path = require("path")
const {transcribeAudio} = require("../services/saharaService")
const {extractPhoneNumber, extractBankNames} = require("../services/extractionService")



const findFailedTransaction = async (phoneNumber, senderBank, destinationBank) => {
  return Transaction.findOne({ phoneNumber, senderBank, destinationBank, status: "FAILED" })
}

const refundTransaction = async (transactionId) => {
  const transaction = await Transaction.findOne({ transactionId });
  if (!transaction) {
    return { success: false, status: 404, message: "Transaction not found" };
  }
  if (transaction.status === "REFUNDED") {
    return {
      success: false,
      status: 409,
      message: "Transaction has already been refunded",
    };
  }
  if (transaction.status === "SUCCESSFUL") {
    return {
      success: false,
      status: 409,
      message: "Transaction was successful and cannot be refunded",
    };
  }

  const updated = await Transaction.findOneAndUpdate(
    { transactionId, status: "FAILED" },
    {
      $inc: { accountBalance: transaction.amount },
      $set: { status: "REFUNDED" },
    },
    { new: true },
  );

  if (!updated) {
    return {
      success: false,
      status: 409,
      message:
        "This transaction is no longer eligible for refund, it may have just been processed by another request",
    };
  }

  return { success: true, status: 200, transaction: updated };
};

const checkFailedTransaction = async (req, res) => {
  try {
    const {phoneNumber, senderBank, destinationBank} = req.body 
    if(!phoneNumber || !senderBank || !destinationBank) {
      return res.status(400).json({
        success: false,
        message: "Phone number, sender bank and destination bank are required"
      })
    }

    const transaction = await findFailedTransaction(phoneNumber, senderBank, destinationBank)
    if(!transaction) {
      return res.status(404).json({
        success: false,
        message: "No failed transaction found for the provided details"
      })
    }

    return res.status(200).json({
      success: true,
      data: transaction,
      message: "Transaction seen and you will be refunded soon"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "an error occured " + error.message
    })
  }
}

const processRefund = async (req, res) => {
  try {
    const {transactionId} = req.body
    if(!transactionId) {
      return res.status(404).json({
        success: false,
        message: "Transaction ID is required"
      })
    }

    const result = await refundTransaction(transactionId)
    if(!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      })
    }

    return res.status(200).json({
      success: true,
      data: result.transaction,
      refundedAmount: result.transaction.amount,
      accountBalance: result.transaction.accountBalance,
      message: "Transaction has been refunded successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "an error occured " + error.message,
    });
  }
}

const handleVoiceComplaint = async (req, res) => {
  try {
    const audioBuffer = fs.readFileSync(
      path.join(__dirname, "../audio/light.pcm"),
    );

    const transcript = await transcribeAudio(audioBuffer)

    const phoneNumber = extractPhoneNumber(transcript)
    const banks = extractBankNames(transcript)

    if (!phoneNumber || banks.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Could not clearly detect phone number and both banks from the complaint. Please try again.",
        transcript,
      });
    }

    const [senderBank, destinationBank] = banks

    const transaction = await findFailedTransaction(
      phoneNumber,
      senderBank,
      destinationBank,
    );
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "No failed transaction found for the provided details",
        extracted: { phoneNumber, senderBank, destinationBank },
        transcript,
      });
    }

    const refundResult = await refundTransaction(transaction.transactionId);

    if (!refundResult.success) {
      return res.status(refundResult.status).json({
        success: false,
        message: refundResult.message,
        extracted: { phoneNumber, senderBank, destinationBank },
        transcript,
      });
    }

    return res.status(200).json({
      success: true,
      data: refundResult.transaction,
      extracted: { phoneNumber, senderBank, destinationBank },
      transcript,
      refundedAmount: refundResult.transaction.amount,
      refundedBalance: refundResult.transaction.accountBalance,
      message: "Transaction found and you have been refunded successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "an error occurred " + error.message,
    })
  }
}

module.exports = {checkFailedTransaction, processRefund, handleVoiceComplaint}