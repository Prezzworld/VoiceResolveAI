const express = require("express")
const router = express.Router()
const {checkFailedTransaction, processRefund} = require("../controllers/ledgerController")

router.post("/check-failed-transaction", checkFailedTransaction)
router.post("/process-refund", processRefund)

module.exports = router