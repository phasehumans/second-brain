import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

export const dbConnect = async() => {

    if(!process.env.MONGO_URL){
        throw new Error("MONGO_URL not found in .env")
        
    }
    await mongoose.connect(process.env.MONGO_URL)
    console.log("monogodb connected")
}