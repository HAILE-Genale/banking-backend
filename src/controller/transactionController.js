const Account = require("../models/Account");
const Transaction = require("../models/transaction");

exports.deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const account = await Account.findOne({ user: userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    account.balance += amount;
    await account.save();

    await Transaction.create({
      toAccount: account._id,
      amount,
      type: "deposit"
    });

    res.json({ message: "Deposit successful", balance: account.balance });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const account = await Account.findOne({ user: userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    if (account.balance < amount) return res.status(400).json({ message: "Insufficient funds" });

    account.balance -= amount;
    await account.save();

    await Transaction.create({
      fromAccount: account._id,
      amount,
      type: "withdraw"
    });

    res.json({ message: "Withdrawal successful", balance: account.balance });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.transfer = async (req, res) => {
  try {
    const { toAccountNumber, amount } = req.body;
    const userId = req.user.id;

    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const fromAccount = await Account.findOne({ user: userId });
    if (!fromAccount) return res.status(404).json({ message: "Your account not found" });

    if (fromAccount.balance < amount) return res.status(400).json({ message: "Insufficient funds" });

    const toAccount = await Account.findOne({ accountNumber: toAccountNumber });
    if (!toAccount) return res.status(404).json({ message: "Recipient account not found" });

    // Atomic operation
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await fromAccount.save();
    await toAccount.save();

    await Transaction.create({
      fromAccount: fromAccount._id,
      toAccount: toAccount._id,
      amount,
      type: "transfer"
    });

    res.json({ message: "Transfer successful", balance: fromAccount.balance });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const account = await Account.findOne({ user: userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const transactions = await Transaction.find({
      $or: [
        { fromAccount: account._id },
        { toAccount: account._id }
      ]
    }).sort({ createdAt: -1 });

    res.json(transactions);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};