const Account = require("../models/Account");
const generateAccountNumber = require("../utils/generateAccountNumber");

exports.createAccount = async (req, res) => {

  try {

    const userId = req.user.id;
    const existingAccount = await Account.findOne({ user: userId });

    if (existingAccount) {
      return res.status(400).json({
        message: "User already has an account"
      });
    }
    const accountNumber = generateAccountNumber();

    const account = await Account.create({
      user: userId,
      accountNumber
    });
    res.status(201).json({
      message: "Account created",
      account
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};