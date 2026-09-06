const Transaction  = require("../models/transaction");

const checkFailedTransaction = async (req, res) => {
  try {
    const {phoneNumber, senderBank, destinationBank} = req.body 
    if(!phoneNumber || !senderBank || !destinationBank) {
      return res.status(400).json({
        success: false,
        message: "Phone number, sender bank and destination bank are required"
      })
    }

    const transaction = await Transaction.findOne({phoneNumber, senderBank, destinationBank, status: "FAILED"})
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

    let transaction = await Transaction.findOne({transactionId})
    if(!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      })
    }
    if(transaction.status === "REFUNDED") {
      return res.status(409).json({
        success: false,
        message: "Transaction has already been refunded"
      })
    } else if(transaction.status === "SUCCESSFUL") {
      return res.status(409).json({
        success: false,
        message: "Transaction was successful and cannot be refunded"
      })
    }

    transaction = await Transaction.findOneAndUpdate({transactionId, status: "FAILED"}, {$inc: {accountBalance: transaction.amount}, $set: {status: "REFUNDED"}}, {new: true})
    if (!transaction) {
      return res.status(409).json({
        success: false,
        message:
          "This transaction is no longer eligible for refund, it may have just been processed by another request",
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction,
      refundedAmount: transaction.amount,
      accountBalance: transaction.accountBalance,
      message: "Transaction has been refunded successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "an error occured " + error.message,
    });
  }
}

module.exports = {checkFailedTransaction, processRefund}