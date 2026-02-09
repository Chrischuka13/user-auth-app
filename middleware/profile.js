import getDataFromToken from "../helpers/getDataFromToken.js"
import express from "express"
import User from "../models/user.js"

const router = express.Router();

router.get("/profile", async (req, res) => {
    try {
        const userId = getDataFromToken(req)
        const user = await User.findById({_id: userId}).select("-password")

        res.status(200).json({
            user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified
        }
        });

    } catch (err) {
        console.error(err.message)
        res.status(500).json({message: "server error"})
    }
})

export default router;