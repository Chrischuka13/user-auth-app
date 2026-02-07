import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import User from "../models/user.js"
import Mailer from "../utils/Mailer.js"



const router = express.Router()

router.post('/signup', async (req, res) => {
    try {
        const {name, email, password} = req.body
        
        // check for existing user
        const existing = await User.findOne({ email })
        if (existing) {
            return res.status(400).json({message: "email is already registered"})
        }
        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)
        // create user
        const newUser = new User({name, email, password: hashPassword})
        await newUser.save()

        await Mailer({email: newUser.email, emailType: "VERIFY", userId: newUser._id})

        res.status(201).json({
            message: "user created successfully",
            user: {id: newUser._id, name: newUser.name, email: newUser.email}
        })

    } catch (err) {
        console.error("SignUp API error", err.message);
        res.status(500).json({message: "server error"})
        
    }
});

router.post("/login", async(req, res) =>{
    try {
        const {email, password} = req.body
        
        const existing = await User.findOne({email})
        if (!existing) {
            return res.status(400).json({message: "User does not exist"})
        }

        //check if password matches with email
        const validPassword = await bcrypt.compare(password, existing.password)
        if (!validPassword) {
            return res.status(400).json({message: "Email or password is wrong"})
        }

        //create token data
        const tokenData = {
            id: existing._id,
            name: existing.name,
            email: existing.email
        }
        //create token
        const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {expiresIn: "1h"})

        //enables secure cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        })

        res.status(200).json({
            message: "User login successfully",
            user: {id: existing._id, email: existing.email}, token
        })


    } catch (err) {
        console.error("Login API error", err.message);
        res.status(500).json({message: "server error"})
    }
})


router.post("/verifymail", async (req, res) => {
    try {
        //get token from user
        const { token } = req.body

        // server checks if the token user provided matches
        const user = await User.findOne({verifyToken: token,
            verifyTokenExpires: {$gt: Date.now()}
        })

        if (!token) {
            return res.status(400).json({ error: "Token is required" });
        }
        if (!user) {
            return res.status(400).json({message: "invalid token"})
        }

        //set user verification to true and reset token so no one can use it
        user.isVerified = true
        user.verifyToken = true
        user.verifyTokenExpires = true

        await user.save()

        return res.status(200).json({
            message: "Email verified successfully", 
        })

    } catch (err) {
        console.error("email verification failed", err.message)
        res.status(500).json({message: "server error"})
    }
})



router.post("/forgotpassword", async (req, res) => {
    try {
        //server requests email, to check if user exists
        const { email }  = req.body
        const user = await User.findOne({email}) 

        if (!user) {
            return res.status(400).json({message: "user not found"})
        }
        // reset password link sent to email
        await Mailer({email: newUser.email, emailType: "RESET", userId: newUser._id})

        res.json({message: "reset link sent successfully"})

    } catch (err) {
        console.error(err.message)
        res.status(500).json({message: "server error"})
    }
})

router.post("/resetpassword", async (req, res) => {
    try {
        //get password and token from user
        const {token, password} = req.body

        if (!password) 
            return res.status(400).json({
                message: 'please provide a new password'
            })  
        //hash the token being sent to user
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {$gt: Date.now()}
        })
        if (!user) {
            return res.status(400).json({message: 'Invalid or expired token'})
        }

        //hash the new password 
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        return res.status(200).json({
            message: "Password reset successfully"})
        

    } catch (err) {
        console.error(err.message);
        res.status(500).json({message: "server error"})
    }
})

router.get("/logout", async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            expires: new Date(0)
        })
        return res.status(200).json({
        message: "Logout Successful"
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({message: "server error"})
    }
})


export default router;