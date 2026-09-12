const {z} = require("zod")

const checkFailedTransactionSchema = z.object({
  phoneNumber: z.string().trim().regex(/^\+?\d{10,15}$/, "Phone number must be 10-15 digits, optionally starting with +"),
  senderBank: z.string().trim().min(2, "Sender bank name is required").max(100, "Sender bank name must be less than 100 characters"),
  destinationBank: z.string().trim().min(2, "Destination bank name is required").max(100, "Destination bank name must be less than 100 characters"),
})

const refundTransactionSchema = z.object({
  transactionId: z.string().trim().min(1, "Transaction ID is required").max(50, "Transaction id must be less than 50 characters"),
})

module.exports = {checkFailedTransactionSchema, refundTransactionSchema}