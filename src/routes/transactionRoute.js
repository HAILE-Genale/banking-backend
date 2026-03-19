const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const transactionController = require("../controller/transactionController");

router.post("/deposit", authMiddleware, transactionController.deposit);
router.post("/withdraw", authMiddleware, transactionController.withdraw);
router.post("/transfer", authMiddleware, transactionController.transfer);
router.get("/history", authMiddleware, transactionController.getTransactions);

module.exports = router;