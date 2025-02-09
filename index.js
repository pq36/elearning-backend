import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"
import bodyParser from "body-parser"
import route from "./routes/elearning.js"
dotenv.config()
const app=express()
app.use(cors())
app.use(bodyParser.json())
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
  
app.use("/api",route)
const URL=process.env.MONGO_URL
const PORT=process.env.PORT

mongoose.connect(URL).then(()=>{
    console.log("DB Connected successfully!!!")
    app.listen(PORT,()=>{
        console.log(`server is running on http://localhost:${PORT}`)
    })
})
.catch((error)=>{
    console.log(error)
})
