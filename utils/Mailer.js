import nodemailer from 'nodemailer'
import User from "../models/user.js"
import crypto from "crypto"

const sendMail = async({email, emailType, userId}) => {
    try {
        // create a hash token
        const hashToken = crypto.randomBytes(32).toString("hex");

        //update a user
        if (emailType === "VERIFY") {
        await User.findByIdAndUpdate(userId,
        {verifyToken: hashToken,
        verifyTokenExpires: Date.now() + 3600000}) //1hr

        } else if (emailType === "RESET") {
        await User.findByIdAndUpdate(userId,
        {resetPasswordToken: hashToken,
        resetPasswordExpires: Date.now() + 3600000}) //1hr
        }
 
        const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false,
        }
        });

        await transport.verify()

        const actionUrl = emailType === "VERIFY"? `${process.env.domain}/verifymail/${hashToken}` : `${process.env.domain}/resetpassword/${hashToken}`;
        
        const mailOptions = {
            from: `"Chuka's Auth-Project" ${process.env.EMAIL_USER}`,
            to: email,
            subject: emailType === "VERIFY"? "Verify your email" : "Reset your password",
            html: `<p>Click <a href="${actionUrl}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"} or copy and paste the link below in your browser.
            <br> ${actionUrl}</p>`
        }

        const mailResponse = await transport.sendMail(mailOptions) 
        return mailResponse;
        
    } catch (error) {
        console.error(error)
        throw new Error("Email could not be sent")
    }
}


export default sendMail;