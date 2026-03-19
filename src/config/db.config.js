const mongoose = require("mongoose");
require("dotenv").config();
 const connectDb=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("connected to db")
    }
    catch(error){
        console.log("error connecting to db",error)
    }       
    
 }
    module.exports=connectDb;
