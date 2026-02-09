import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import User from "../models/user.js"
import sendMail from "../utils/Mailer.js"

const router = express.Router()

const signToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })
};


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

        const verificationToken = crypto.randomBytes(20).toString('hex');
        const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // create user
        const newUser = await User.create({
        name,
        email,
        password: hashPassword,
        verifyToken: verificationToken,
        verifyTokenExpires: verificationTokenExpire,
        })

        await sendMail({email: newUser.email, emailType: "VERIFY", userId: newUser._id})

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
        
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({message: "User does not exist"})
        }
        if (!user.isVerified) {
            return res.status(401).json({message: 'Please verify your email first'});
        }

        //check if password matches with email
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return res.status(400).json({message: "Email or password is wrong"})
        }

        const token = signToken(user._id)

        //enables secure cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        })

        res.status(200).json({
            message: "User login successfully",
            user: {id: user._id, email: user.email}, token
        })


    } catch (err) {
        console.error("Login API error", err.message);
        res.status(500).json({message: "server error"})
    }
})


router.get("/verifymail/:token", async (req, res) => {
    try {
        //get token from user
        const { token } = req.params

        // server checks if the token user provided matches
        const user = await User.findOne({verifyToken: token,
            verifyTokenExpires: {$gt: Date.now()}
        })

        if (!token) {
            return res.status(400).json({ error: "Token is required" });
        }
        if (!user) {
            return res.status(400).json({message: "invalid or expired token"})
        }

        //set user verification to true and reset token so no one can use it
        user.isVerified = true
        user.verifyToken = undefined
        user.verifyTokenExpires = undefined

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
        //generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        user.resetPasswordToken = resetToken
        user.resetPasswordExpires = resetTokenExpire
        // reset password link sent to email
        await sendMail({email: newUser.email, emailType: "RESET", userId: newUser._id})

        res.json({message: "reset link sent successfully"})

    } catch (err) {
        console.error(err.message)
        res.status(500).json({message: "server error"})
    }
})

router.post("/resetpassword/:token", async (req, res) => {
    try {
        //get password and token from user
        const { token } = req.params
        const { password } = req.body

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