const knownBanks = [
  "GTBank",
  "Zenith Bank",
  "Access Bank",
  "First Bank",
  "UBA",
  "Ecobank",
  "Stanbic IBTC",
  "Fidelity Bank",
  "Union Bank",
  "Polaris Bank",
  "Wema Bank",
  "Sterling Bank",
  "Keystone Bank",
  "Unity Bank",
  "Heritage Bank",
  "FBN Holdings",
  "Providus Bank",
  "Globus Bank",
  "Kuda Bank",
  "Rubies Bank",
  "VFD Microfinance Bank",
];


const extractPhoneNumber = (transcript) => {
  const match = transcript.match(/\+?\d{10,15}/)
  return match ? match[0] : null
}

const extractBankNames = (transcript) => {
  const lowerTranscript = transcript.toLowerCase()
  const foundBanks =  knownBanks.filter(bankName => lowerTranscript.includes(bankName.toLowerCase())).map(bankName => ({
    name: bankName,
    position: lowerTranscript.indexOf(bankName.toLowerCase())
  })).sort((a, b) => a.position - b.position).map(bank => bank.name)

  return foundBanks
}

module.exports = {extractPhoneNumber, extractBankNames}