const {z} = require("zod")

const checkFailedTransactionSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required"),
  senderBank: z.string().min(2, "Sender bank name is required"),
  destinationBank: z.string().min(2, "Destination bank name is required"),
})

const refundTransactionSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
})

module.exports = {checkFailedTransactionSchema, refundTransactionSchema}