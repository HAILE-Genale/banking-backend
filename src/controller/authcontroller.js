const User = require("../models/user");
const Account = require("../models/Account");   
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {

    try {

        const { name, email, password } = req.body;
    

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered",
            user
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
 exports.login = async (req, res) => {  

    try{
        const { email,password }=req.body;
        const user= await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid credentials"})
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials"})
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1h"});
        res.status(200).json({message:"Login successful",token});
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
 }
 exports.getMe= async (req, res) => {
  try {

    const userId = req.user.id;

    const account = await Account.findOne({ user: userId });

    if (!account) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    res.json(account);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
