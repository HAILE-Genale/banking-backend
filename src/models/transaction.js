const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }, // optional for deposits
  toAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },   // optional for withdrawals
  amount: { type: Number, required: true },
  type: { type: String, enum: ["deposit", "withdraw", "transfer"], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);