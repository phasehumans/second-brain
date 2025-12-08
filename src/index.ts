import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { UserModel } from "./models/user.model.js"

const app = express()
app.use(express.json())

app.post("/api/v1/signup" , async(req, res) =>{
    // zod validation

    const username = req.body.username
    const password = req.body.password

    const hashPassword = await bcrypt.hash(password, 10)

    try {
        const userCreated = await UserModel.create({
            username : username,
            password : hashPassword
        })
        
        if(userCreated){
            res.status(200).json({
                message: "signed up sucessfull"
            })
        }
    } catch (error) {
        res.status(500).json({
            message : "internal server error"

        })
    }
})

