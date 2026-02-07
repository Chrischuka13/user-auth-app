import mongoose from "mongoose";
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String, 
        required: true,
        trim: true
    },
    email: {
        type: String, 
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false,
    },

    // reset password
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // verify email
    verifyToken: String,
    verifyTokenExpires: Date,

    createdAt: {
        type: Date,
        default: Date.now,
    }
})

export default mongoose.model("User_auth", userSchema);