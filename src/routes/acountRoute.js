const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const acountController = require("../controller/acountontroller");

router.post("/create", authMiddleware, acountController.createAccount);

module.exports = router;