import "dotenv/config"
import cors from "cors"
import mongoose from "mongoose"
import express from "express"
import authRoutes from "./routes/auth.js"
import cookieParser from "cookie-parser";
import protectRoutes from "./middleware/middleware.js";
const app = express()
const PORT = process.env.PORT || 8000 

app.use(cors())
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth/me', protectRoutes, (req, res)=>{
    req.json({user: req.user})
})
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("server running")
})


const startServer = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        app.listen(PORT, () =>{
            console.log(`server is running on ${PORT}`);
            
        })
    } catch (error) {
        console.log(error);
        
    }
}

startServer()