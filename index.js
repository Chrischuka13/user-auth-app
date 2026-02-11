import "dotenv/config"
import cors from "cors"
import mongoose from "mongoose"
import express from "express"
import authRoutes from "./routes/auth.js"
import cookieParser from "cookie-parser";
import profileRoute from './middleware/profile.js'
const app = express()
const PORT = process.env.PORT || 8000 


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/auth", profileRoute)

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