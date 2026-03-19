# Bank API (Learning Project)

This is a small Node.js + Express + MongoDB (Mongoose) REST API that teaches:

- How to structure a basic API (`routes/` → `controller/` → `models/`)
- How authentication works (hash passwords with `bcrypt`, login with `jsonwebtoken` JWTs)
- How to protect routes with a middleware (Bearer token → `req.user`)
- How to model “bank” concepts (Account, Transaction) and implement deposit/withdraw/transfer

If you want to *rebuild* this project from zero and understand *why every line exists*, read **Rebuild From Scratch (With Reasons)**.

## Quick start (run this repo)

1) Install dependencies (why: downloads everything in `package.json` so the code can run):
```bash
npm install
```

2) Create `.env` in the project root (why: secrets/config should not be hard-coded in source files):
```env
MONGO_URL=mongodb://127.0.0.1:27017/bank_api
JWT_SECRET=change_me_to_a_long_random_secret
PORT=5000
```

3) Start the server (why: `nodemon` restarts the server automatically when you save files):
```bash
npm run dev
```

Server: `http://localhost:5000`

## API endpoints (what to test)

### Auth (`/api/auth`)

- `POST /api/auth/register` (create a user)
  - body:
    ```json
    { "name": "Jane", "email": "jane@example.com", "password": "pass1234" }
    ```
- `POST /api/auth/login` (get a JWT)
  - body:
    ```json
    { "email": "jane@example.com", "password": "pass1234" }
    ```
  - response includes `token`
- `GET /api/auth/me` (get your account info)
  - header: `Authorization: Bearer <token>`

### Accounts (`/account`)

- `POST /account/create` (create an account for the logged-in user)
  - header: `Authorization: Bearer <token>`

### Transactions (`/transaction`)

- `POST /transaction/deposit`
  - header: `Authorization: Bearer <token>`
  - body: `{ "amount": 1000 }`
- `POST /transaction/withdraw`
  - header: `Authorization: Bearer <token>`
  - body: `{ "amount": 200 }`
- `POST /transaction/transfer`
  - header: `Authorization: Bearer <token>`
  - body: `{ "toAccountNumber": "1234567890", "amount": 50 }`
- `GET /transaction/history`
  - header: `Authorization: Bearer <token>`

## Project structure (what each folder means)

```text
.
├── src/
│   ├── config/
│   │   └── db.config.js                # Connect to MongoDB using Mongoose
│   ├── controller/
│   │   ├── authcontroller.js           # Register/login + “me” (account for current user)
│   │   ├── acountontroller.js          # Create account (note: filename has a typo)
│   │   ├── transactionController.js    # Deposit/withdraw/transfer/history
│   │   ├── authme.js                   # Placeholder (currently unused)
│   │   └── userControll.js             # Placeholder (currently minimal)
│   ├── middleware/
│   │   └── authMiddleware.js           # Reads JWT, sets req.user, blocks if invalid
│   ├── models/
│   │   ├── user.js                     # User schema/model
│   │   ├── Account.js                  # Account schema/model
│   │   └── transaction.js              # Transaction schema/model
│   ├── routes/
│   │   ├── authroute.js                # /api/auth routes
│   │   ├── acountRoute.js              # /account routes (note: filename has a typo)
│   │   └── transactionRoute.js         # /transaction routes
│   ├── utils/
│   │   └── generateAccountNumber.js    # Generates a random 10-digit account number
│   └── index.js                        # Express app entry point
├── .env                                # Local secrets (should NOT be committed)
├── package.json
└── package-lock.json
```

## Rebuild From Scratch (With Reasons)

This section is intentionally “learning style”: commands + what they do + why we need them.

### 1) Start a Node project

```bash
mkdir bank-api
cd bank-api
npm init -y
```

Why each command matters:

- `mkdir bank-api`: creates a folder so the project is isolated
- `cd bank-api`: moves into the project folder so npm installs locally
- `npm init -y`: generates `package.json` automatically (“-y” means accept defaults)
  - we need `package.json` because it stores dependencies, scripts, and project metadata

### 2) Install packages (and the reason for each one)

```bash
npm install express mongoose dotenv bcrypt jsonwebtoken cors
npm install -D nodemon
```

Why each dependency exists:

- `express`: handles HTTP routing (`app.get`, `app.post`, `router`)
- `mongoose`: connects to MongoDB + defines schemas/models
- `dotenv`: reads `.env` and puts values into `process.env`
- `bcrypt`: hashes passwords so you never store plain text passwords
- `jsonwebtoken`: creates/verifies JWT tokens for login sessions
- `cors`: allows the API to be called from a browser app on another domain/port
- `nodemon` (dev): restarts your server automatically while coding

### 3) Add a dev script

In `package.json` add:

```json
{
  "scripts": {
    "dev": "nodemon src/index.js"
  }
}
```

Why:

- scripts remove the need to remember long commands
- `src/index.js` becomes the single “entry file” that starts the app

### 4) Create the folders

```bash
mkdir src src\\config src\\routes src\\controller src\\models src\\middleware src\\utils
```

Why:

- `routes/` is “URLs → controllers”
- `controller/` is “request handling logic” (use models here)
- `models/` is “MongoDB structure” (schemas + data rules)
- `middleware/` is “code that runs before handlers” (auth checks, etc.)
- `config/` is “setup code” (DB connection)
- `utils/` is “small helper functions” (account number generator)

### 5) Create `.env`

Create a `.env` file in the project root:

```env
MONGO_URL=mongodb://127.0.0.1:27017/bank_api
JWT_SECRET=change_me_to_a_long_random_secret
PORT=5000
```

Why each variable matters:

- `MONGO_URL`: the database connection string (changes per machine/environment)
- `JWT_SECRET`: used to sign/verify tokens (must be secret; never commit it)
- `PORT`: lets you change the server port without editing code

### 6) Write the code (annotated line-by-line)

The code in this repo is already written. This section shows how you would write it, and *why every line exists*.

#### `src/index.js` (Express app entry)

Why this file exists: this is the first file that runs; it configures middleware, routes, DB, and starts the server.

```js
const express = require("express"); // Import Express so we can create an HTTP server.
const app = express(); // Create the Express application instance.
require("dotenv").config(); // Load variables from .env into process.env as early as possible.
const cors = require("cors"); // Import CORS middleware so browsers can call this API.
const connectDb = require("./config/db.config"); // Import our MongoDB connection function.
const authRoute = require("./routes/authroute"); // Import authentication routes (/register, /login, /me).
const accountRoutes = require("./routes/acountRoute"); // Import account routes (/create).
const transactionRoutes = require("./routes/transactionRoute"); // Import transaction routes (/deposit, /withdraw, /transfer, /history).
app.use(express.json()); // Parse JSON request bodies so req.body is available in controllers.
app.use(cors()); // Enable CORS for all routes (simple dev-friendly default).
app.use("/api/auth", authRoute); // Mount auth router: /api/auth/register, /api/auth/login, /api/auth/me.
app.use("/account", accountRoutes); // Mount account router: /account/create.
app.use("/transaction", transactionRoutes); // Mount transaction router: /transaction/deposit, etc.
connectDb(); // Connect to MongoDB so models can read/write data.
const PORT = process.env.PORT || 5000; // Use PORT from .env, or fallback to 5000.
app.listen(PORT, () => { // Start the server and begin listening for requests.
  console.log(`server is running on port ${PORT}`); // Log so you can confirm it started.
}); // Close listen callback and the listen call.
```

#### `src/config/db.config.js` (MongoDB connection)

Why this file exists: DB connection is setup code, so we keep it out of `index.js` to stay organized.

```js
const mongoose = require("mongoose"); // Import Mongoose so we can connect to MongoDB.
require("dotenv").config(); // Load .env here too (safe if called multiple times).
const connectDb = async () => { // Create an async function because mongoose.connect returns a promise.
  try { // Wrap in try/catch so connection errors don't crash silently.
    await mongoose.connect(process.env.MONGO_URL); // Connect using the URL from .env.
    console.log("connected to db"); // Confirm DB connection for debugging.
  } catch (error) { // Handle connection failure.
    console.log("error connecting to db", error); // Print the error so you can fix it.
  } // End catch block.
}; // End function definition.
module.exports = connectDb; // Export so `src/index.js` can call connectDb().
```

#### `src/models/user.js` (User model)

Why: models define the “shape” of data stored in MongoDB and help validate it.

```js
const mongoose = require("mongoose"); // Import Mongoose to create a schema.
const userSchema = new mongoose.Schema({ // Define the structure of a user document.
  name: { type: String, required: true }, // Name is required for display/identity.
  email: { type: String, required: true, unique: true }, // Email is required and must be unique (login key).
  password: { type: String, required: true }, // Store only the hashed password (never plain text).
  role: { type: String, default: "user" } // Optional field for permissions later.
}, { timestamps: true }); // Add createdAt/updatedAt automatically.
module.exports = mongoose.model("User", userSchema); // Create and export the User model.
```

#### `src/models/Account.js` (Account model)

Why: an account belongs to a user and stores a balance + account number.

```js
const mongoose = require("mongoose"); // Import Mongoose to create a schema.
const accountSchema = new mongoose.Schema({ // Define the structure of an account document.
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link account to a User.
  accountNumber: { type: String, unique: true, required: true }, // A human-friendly unique account number.
  balance: { type: Number, default: 0 } // Store money as a number (learning project; real apps use decimals/integers).
}, { timestamps: true }); // Add createdAt/updatedAt automatically.
module.exports = mongoose.model("Account", accountSchema); // Create and export the Account model.
```

#### `src/models/transaction.js` (Transaction model)

Why: every deposit/withdraw/transfer should be recorded so we can show history.

```js
const mongoose = require("mongoose"); // Import Mongoose to create a schema.
const transactionSchema = new mongoose.Schema({ // Define the structure of a transaction record.
  fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }, // Optional: withdrawals/transfers.
  toAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }, // Optional: deposits/transfers.
  amount: { type: Number, required: true }, // Amount must exist for all transaction types.
  type: { type: String, enum: ["deposit", "withdraw", "transfer"], required: true }, // Only allow these types.
  createdAt: { type: Date, default: Date.now } // Timestamp for sorting/statement views.
}); // End schema definition.
module.exports = mongoose.model("Transaction", transactionSchema); // Create and export the Transaction model.
```

#### `src/utils/generateAccountNumber.js` (Helper)

Why: controllers should stay focused on request logic, so helpers go in `utils/`.

```js
const generateAccountNumber = () => { // Create a function so we can reuse it.
  const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000); // Generate a random 10-digit number.
  return randomNumber.toString(); // Convert to string (account numbers often treated as strings).
}; // End function.
module.exports = generateAccountNumber; // Export for use in the account controller.
```

#### `src/middleware/authMiddleware.js` (JWT protection)

Why: middleware runs before your controller; perfect for “block unauthenticated users” logic.

```js
const jwt = require("jsonwebtoken"); // Import JWT tools to verify tokens.
const authMiddleware = (req, res, next) => { // Middleware signature: (req, res, next).
  const authHeader = req.headers.authorization; // Read the Authorization header from the request.
  if (!authHeader) return res.status(401).json({ message: "No token provided" }); // Block if no token at all.
  const token = authHeader.split(" ")[1]; // Expect "Bearer <token>", so index 1 is the token.
  try { // If verify fails, jwt.verify throws.
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token signature using our secret.
    req.user = decoded; // Attach user info (we store { id: user._id } in the token).
    next(); // Continue to the real route handler (controller).
  } catch (error) { // Token invalid/expired/modified.
    return res.status(401).json({ message: "Invalid token" }); // Block access to protected routes.
  } // End catch.
}; // End middleware.
module.exports = authMiddleware; // Export so routes can use it.
```

#### `src/routes/authroute.js` (Auth routes)

Why: routes define URL paths and choose which controller function handles them.

```js
const express = require("express"); // Import Express to create a router.
const router = express.Router(); // Create a router so we can group auth endpoints.
const authController = require("../controller/authcontroller"); // Import controller functions.
const authMiddleware = require("../middleware/authMiddleware"); // Import middleware for protected endpoints.
router.post("/register", authController.register); // POST /api/auth/register → create a user.
router.post("/login", authController.login); // POST /api/auth/login → verify password and return token.
router.get("/me", authMiddleware, authController.getMe); // GET /api/auth/me → requires token, returns your account.
module.exports = router; // Export router so `index.js` can mount it.
```

#### `src/controller/authcontroller.js` (Register/login/me)

Why: controllers hold the “business logic” for each endpoint (validate input, call models, return JSON).

```js
const User = require("../models/user"); // We need the User model to create/find users in MongoDB.
const Account = require("../models/Account"); // We need the Account model for the /me endpoint.
const bcrypt = require("bcrypt"); // We need bcrypt to hash and compare passwords securely.
const jwt = require("jsonwebtoken"); // We need JWT to create login tokens.
exports.register = async (req, res) => { // Register endpoint handler (async because DB calls are async).
  try { // Use try/catch for safe error handling.
    const { name, email, password } = req.body; // Read fields from request JSON body.
    const existingUser = await User.findOne({ email }); // Check if the email is already registered.
    if (existingUser) return res.status(400).json({ message: "User already exists" }); // Block duplicates.
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password (10 = salt rounds; slower = safer).
    const user = await User.create({ name, email, password: hashedPassword }); // Create user with hashed password.
    res.status(201).json({ message: "User registered", user }); // Return created user (learning project; real apps avoid returning sensitive fields).
  } catch (error) { // Any unexpected error (DB, validation, etc.).
    res.status(500).json({ error: error.message }); // Return server error to help debugging.
  } // End catch.
}; // End register handler.
exports.login = async (req, res) => { // Login endpoint handler.
  try { // Wrap logic in try/catch for safe errors.
    const { email, password } = req.body; // Read credentials from request body.
    const user = await User.findOne({ email }); // Find user by email.
    if (!user) return res.status(400).json({ message: "Invalid credentials" }); // Don’t reveal if email exists.
    const isMatch = await bcrypt.compare(password, user.password); // Compare plain password to hashed password.
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" }); // Block wrong password.
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Create a short-lived token.
    res.status(200).json({ message: "Login successful", token }); // Return token to client.
  } catch (error) { // Unexpected error.
    res.status(500).json({ error: error.message }); // Return error message.
  } // End catch.
}; // End login handler.
exports.getMe = async (req, res) => { // “Me” endpoint: returns the logged-in user’s account.
  try { // Use try/catch for safety.
    const userId = req.user.id; // Read user id set by authMiddleware after verifying the token.
    const account = await Account.findOne({ user: userId }); // Find the account that belongs to this user.
    if (!account) return res.status(404).json({ message: "Account not found" }); // If user hasn’t created an account yet.
    res.json(account); // Return the account document as JSON.
  } catch (error) { // Unexpected errors.
    res.status(500).json({ error: error.message }); // Return server error.
  } // End catch.
}; // End getMe handler.
```

#### `src/routes/acountRoute.js` + `src/controller/acountontroller.js` (Create account)

Why: accounts are created only for logged-in users, so we protect this route with auth middleware.

`src/routes/acountRoute.js`:

```js
const express = require("express"); // Import Express to create a router.
const router = express.Router(); // Create router for account endpoints.
const authMiddleware = require("../middleware/authMiddleware"); // Import auth middleware to protect account creation.
const acountController = require("../controller/acountontroller"); // Import account controller logic.
router.post("/create", authMiddleware, acountController.createAccount); // POST /account/create → needs token, creates account.
module.exports = router; // Export router for mounting in index.js.
```

`src/controller/acountontroller.js`:

```js
const Account = require("../models/Account"); // We need the Account model to create accounts in MongoDB.
const generateAccountNumber = require("../utils/generateAccountNumber"); // We need a helper to generate account numbers.
exports.createAccount = async (req, res) => { // Handler to create an account for the logged-in user.
  try { // Wrap in try/catch for safe errors.
    const userId = req.user.id; // Get user id from authMiddleware (JWT).
    const existingAccount = await Account.findOne({ user: userId }); // Ensure user has only one account.
    if (existingAccount) return res.status(400).json({ message: "User already has an account" }); // Block duplicates.
    const accountNumber = generateAccountNumber(); // Generate a random 10-digit account number.
    const account = await Account.create({ user: userId, accountNumber }); // Create the account (balance defaults to 0).
    res.status(201).json({ message: "Account created", account }); // Return created account.
  } catch (error) { // Unexpected errors.
    res.status(500).json({ error: error.message }); // Return server error.
  } // End catch.
}; // End handler.
```

#### `src/routes/transactionRoute.js` + `src/controller/transactionController.js` (Bank actions)

Why: transactions change account balances and create transaction records for history.

`src/routes/transactionRoute.js`:

```js
const express = require("express"); // Import Express to create a router.
const router = express.Router(); // Create router for transaction endpoints.
const authMiddleware = require("../middleware/authMiddleware"); // All transactions require login.
const transactionController = require("../controller/transactionController"); // Import controller functions.
router.post("/deposit", authMiddleware, transactionController.deposit); // Add money to your account.
router.post("/withdraw", authMiddleware, transactionController.withdraw); // Remove money from your account.
router.post("/transfer", authMiddleware, transactionController.transfer); // Move money from you to another account.
router.get("/history", authMiddleware, transactionController.getTransactions); // List your transaction history.
module.exports = router; // Export router for mounting in index.js.
```

`src/controller/transactionController.js`:

```js
const Account = require("../models/Account"); // We need accounts to update balances.
const Transaction = require("../models/transaction"); // We need transaction records for history.
exports.deposit = async (req, res) => { // Handler: deposit money.
  try { // Use try/catch for safe errors.
    const { amount } = req.body; // Read deposit amount from request body.
    const userId = req.user.id; // Identify user from verified JWT.
    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" }); // Reject 0/negative.
    const account = await Account.findOne({ user: userId }); // Get the user’s account.
    if (!account) return res.status(404).json({ message: "Account not found" }); // Can’t deposit without an account.
    account.balance += amount; // Add money to the balance.
    await account.save(); // Save the updated balance to MongoDB.
    await Transaction.create({ toAccount: account._id, amount, type: "deposit" }); // Save a transaction record.
    res.json({ message: "Deposit successful", balance: account.balance }); // Return updated balance.
  } catch (error) { // Unexpected error.
    res.status(500).json({ error: error.message }); // Return server error.
  } // End catch.
}; // End deposit.
exports.withdraw = async (req, res) => { // Handler: withdraw money.
  try { // Safe errors.
    const { amount } = req.body; // Read withdrawal amount.
    const userId = req.user.id; // Identify user.
    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" }); // Reject invalid.
    const account = await Account.findOne({ user: userId }); // Find user account.
    if (!account) return res.status(404).json({ message: "Account not found" }); // Must have account.
    if (account.balance < amount) return res.status(400).json({ message: "Insufficient funds" }); // Don’t allow overdraft.
    account.balance -= amount; // Subtract money.
    await account.save(); // Persist new balance.
    await Transaction.create({ fromAccount: account._id, amount, type: "withdraw" }); // Record transaction.
    res.json({ message: "Withdrawal successful", balance: account.balance }); // Return balance.
  } catch (error) { // Unexpected error.
    res.status(500).json({ error: error.message }); // Return error.
  } // End catch.
}; // End withdraw.
exports.transfer = async (req, res) => { // Handler: transfer money to another account number.
  try { // Safe error handling.
    const { toAccountNumber, amount } = req.body; // Read recipient account number and amount.
    const userId = req.user.id; // Identify sender.
    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" }); // Reject invalid.
    const fromAccount = await Account.findOne({ user: userId }); // Get sender account.
    if (!fromAccount) return res.status(404).json({ message: "Your account not found" }); // Must have sender account.
    if (fromAccount.balance < amount) return res.status(400).json({ message: "Insufficient funds" }); // Must have enough.
    const toAccount = await Account.findOne({ accountNumber: toAccountNumber }); // Find recipient by account number.
    if (!toAccount) return res.status(404).json({ message: "Recipient account not found" }); // Recipient must exist.
    fromAccount.balance -= amount; // Decrease sender balance.
    toAccount.balance += amount; // Increase recipient balance.
    await fromAccount.save(); // Save sender.
    await toAccount.save(); // Save recipient.
    await Transaction.create({ fromAccount: fromAccount._id, toAccount: toAccount._id, amount, type: "transfer" }); // Record transfer.
    res.json({ message: "Transfer successful", balance: fromAccount.balance }); // Return sender balance.
  } catch (error) { // Unexpected error.
    res.status(500).json({ error: error.message }); // Return error.
  } // End catch.
}; // End transfer.
exports.getTransactions = async (req, res) => { // Handler: list user transaction history.
  try { // Safe errors.
    const userId = req.user.id; // Identify user.
    const account = await Account.findOne({ user: userId }); // Find user account.
    if (!account) return res.status(404).json({ message: "Account not found" }); // Must have account.
    const transactions = await Transaction.find({ // Find transactions where user is sender OR receiver.
      $or: [{ fromAccount: account._id }, { toAccount: account._id }]
    }).sort({ createdAt: -1 }); // Sort newest first.
    res.json(transactions); // Return array of transactions.
  } catch (error) { // Unexpected error.
    res.status(500).json({ error: error.message }); // Return error.
  } // End catch.
}; // End getTransactions.
```

## Notes (important learning points)

- `app.use(express.json())` must be added **before** routes so `req.body` works in POST requests.
- JWTs are not “magic security”: always use HTTPS in real apps, store secrets safely, and validate inputs.
- This is a learning project: money handling in real banking apps uses careful decimals/integers and transactions/locks.

