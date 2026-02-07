import getDataFromToken from "../helpers/getDataFromToken.js"
import express from "express"
import User from "../models/user.js"

const router = express.Router();

router.post("/profile", async (req, res) => {
    try {
        const userId = getDataFromToken(req)
        const user = await User.findById({_id: userId}).select("-password")

        return res.json({
            message: "user profile found successfully",
            data: user
        });

    } catch (err) {
        console.error(err.message)
        res.status(500).json({message: "server error"})
    }
})

export default router;