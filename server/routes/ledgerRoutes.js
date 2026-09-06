const express = require("express")
const router = express.Router()
const {checkFailedTransaction, processRefund} = require("../controllers/ledgerController")
const validate = require("../middlewares/validate")
const {checkFailedTransactionSchema, refundTransactionSchema} = require("../validators/ledgerValidator")

router.post("/check-failed-transaction", validate(checkFailedTransactionSchema), checkFailedTransaction)
router.post("/process-refund", validate(refundTransactionSchema), processRefund)

module.exports = router