const express = require("express")
const router = express.Router()
const {checkFailedTransaction, processRefund, handleVoiceComplaint} = require("../controllers/ledgerController")
const validate = require("../middlewares/validate")
const {checkFailedTransactionSchema, refundTransactionSchema} = require("../validators/ledgerValidator")
const auth = require("../middlewares/auth")

router.post("/check-failed-transaction", auth, validate(checkFailedTransactionSchema), checkFailedTransaction)
router.post("/voice-complaint", auth, handleVoiceComplaint)
router.post("/process-refund", auth, validate(refundTransactionSchema), processRefund)

module.exports = router