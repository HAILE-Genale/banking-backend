const express=require("express");
const app=express();
require("dotenv").config();
const cors = require("cors");
const connectDb=require("./config/db.config");
const authRoute=require("./routes/authroute")
const accountRoutes = require("./routes/acountRoute");
const transactionRoutes=require("./routes/transactionRoute")

app.use(express.json());
app.use(cors());

app.use("/api/auth",authRoute)
app.use("/account", accountRoutes);
app.use("/transaction", transactionRoutes);
connectDb();
const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})
