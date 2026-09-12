const express = require("express")
const router = express.Router()

router.post("/sahara-callback", (req, res) => {
  // console.log("Sahara webhook received:");
  // console.log(JSON.stringify(req.body, null, 2));
  res.status(200).send("Received");
});

module.exports = router;