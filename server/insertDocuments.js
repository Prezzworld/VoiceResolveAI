require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");
const Transaction = require("./models/transaction");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mockData = [
  {
    customerName: "Fatima Bello",
    phoneNumber: "08034567890",
    accountBalance: 50000,
    transactionId: "TXN-003",
    amount: 30000,
    senderBank: "First Bank",
    destinationBank: "GTBank",
    status: "FAILED",
  },
  {
    customerName: "Emeka Nwosu",
    phoneNumber: "08045678901",
    accountBalance: 5000,
    transactionId: "TXN-004",
    amount: 7500,
    senderBank: "Zenith Bank",
    destinationBank: "Access Bank",
    status: "REFUNDED",
  },
  {
    customerName: "Blessing Adeyemi",
    phoneNumber: "+2348056789012",
    accountBalance: 20000,
    transactionId: "TXN-005",
    amount: 18000,
    senderBank: "UBA",
    destinationBank: "First Bank",
    status: "FAILED",
  },
  {
    customerName: "Ibrahim Musa",
    phoneNumber: "08067890123",
    accountBalance: 100000,
    transactionId: "TXN-006",
    amount: 45000,
    senderBank: "Stanbic IBTC",
    destinationBank: "GTBank",
    status: "SUCCESSFUL",
  },
  {
    customerName: "Ngozi Chukwu",
    phoneNumber: "08078901234",
    accountBalance: 3000,
    transactionId: "TXN-007",
    amount: 6000,
    senderBank: "GTBank",
    destinationBank: "Zenith Bank",
    status: "FAILED",
  },
  {
    customerName: "Tunde Bakare",
    phoneNumber: "+2348089012345",
    accountBalance: 12000,
    transactionId: "TXN-008",
    amount: 22000,
    senderBank: "Access Bank",
    destinationBank: "Ecobank",
    status: "FAILED",
  },
  {
    customerName: "Amaka Obi",
    phoneNumber: "08090123456",
    accountBalance: 9000,
    transactionId: "TXN-009",
    amount: 15000,
    senderBank: "Ecobank",
    destinationBank: "UBA",
    status: "REFUNDED",
  },
  {
    customerName: "Yusuf Abdullahi",
    phoneNumber: "08001234567",
    accountBalance: 60000,
    transactionId: "TXN-010",
    amount: 35000,
    senderBank: "First Bank",
    destinationBank: "Stanbic IBTC",
    status: "SUCCESSFUL",
  },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const result = await Transaction.insertMany(mockData, { ordered: false });
    console.log(`Inserted ${result.length} documents successfully`);
  } catch (err) {
    console.error("Some inserts failed:", err.message);
  } finally {
    await mongoose.disconnect();
  }
});
