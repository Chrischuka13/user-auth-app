import "dotenv/config"
import cors from "cors"
import mongoose from "mongoose"
import express from "express"
import authRoutes from "./routes/auth.js"
import cookieParser from "cookie-parser";
import authMiddleware from './middleware/middleware.js'
import profileRoute from './middleware/profile.js'
const app = express()
const PORT = process.env.PORT || 8000 


app.use(cors());

app.use(express.json());
app.use(cookieParser());

const publicPaths = ["/login", "/signup", "/verifymail"];
app.use(authMiddleware(publicPaths));

app.use("/api/auth", authRoutes);
app.use("/api/auth/profile", profileRoute, (req, res)=>{
    res.json({user: req.user})
})

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