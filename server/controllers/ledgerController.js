const Transaction  = require("../models/transaction");

const checkFailedTransaction = async (req, res) => {
  try {
    const {phoneNumber, senderBank, destinationBank} = req.body 
    if(!phoneNumber || !senderBank || !destinationBank) {
      return res.status(400).send("Please send your phone number, sender bank name, and destination bank name")
    }

    const transaction = await Transaction.findOne({phoneNumber, senderBank, destinationBank, status: "FAILED"})
    if(!transaction) {
      return res.status(404).send("Your transaction was not found")
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
      return res.status(404).send("Transaction ID not found")
    }

    let transaction = await Transaction.findOne({transactionId})
    if(!transaction) {
      return res.status(404).send("Transaction not found")
    }
    if(transaction.status === "REFUNDED") {
      return res.status(409).send("Transaction has already been refunded")
    }

    transaction.status = "REFUNDED"
    transaction.accountBalance += transaction.amount
    await transaction.save()

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