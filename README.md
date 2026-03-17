# Bank API

A simple Node.js (Express) + MongoDB REST API for learning purposes.

## What I’m trying to build

- User authentication (register/login) using hashed passwords (`bcrypt`) and JWTs (`jsonwebtoken`)
- Protected endpoints using an auth middleware (Bearer token)
- Basic “bank” accounts tied to a user, with a generated account number and a starting balance

## Tech

- Node.js + Express
- MongoDB + Mongoose
- JWT auth

## Project structure

```text
.
├─ src/
│  ├─ config/
│  │  └─ db.config.js              # MongoDB connection (Mongoose)
│  ├─ controller/
│  │  ├─ authcontroller.js         # register/login/getMe handlers
│  │  ├─ acountontroller.js        # createAccount handler
│  │  ├─ authme.js                 # (currently unused / placeholder)
│  │  └─ userControll.js           # (currently minimal / placeholder)
│  ├─ middleware/
│  │  └─ authMiddleware.js         # Verifies JWT and sets req.user
│  ├─ models/
│  │  ├─ user.js                   # User schema/model
│  │  └─ Account.js                # Account schema/model
│  ├─ routes/
│  │  ├─ authroute.js              # /api/auth routes
│  │  └─ acountRoute.js            # /account routes
│  ├─ utils/
│  │  └─ generateAccountNumber.js  # Generates a random 10-digit account number
│  └─ index.js                     # App entrypoint (Express server)
├─ .env                            # Local environment variables (do not commit)
├─ package.json
└─ package-lock.json
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root:
   ```env
   MONGO_URL=mongodb://127.0.0.1:27017/bank
   JWT_SECRET=your_secret_here
   PORT=5000
   ```
3. Run the server:
   ```bash
   npm run dev
   ```

Server starts on `http://localhost:5000` (or `PORT`).

## API routes

### Auth (`/api/auth`)

- `POST /api/auth/register`
  - body: `{ "name": "...", "email": "...", "password": "..." }`
- `POST /api/auth/login`
  - body: `{ "email": "...", "password": "..." }`
  - response includes a JWT token
- `GET /api/auth/me`
  - header: `Authorization: Bearer <token>`

### Accounts (`/account`)

- `POST /account/create`
  - header: `Authorization: Bearer <token>`
  - creates an account for the logged-in user

