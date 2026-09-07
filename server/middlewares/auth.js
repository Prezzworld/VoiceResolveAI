const auth = (req, res, next) => {
  const authHeader = req.headers["x-api-key"]
  const apiKey = process.env.API_KEY

  if(!apiKey || authHeader !== apiKey) {
    return res.status(401).json({
      success: false,
      message: "Unable to authenticate user"
    })
  }

  next()
}

module.exports = auth