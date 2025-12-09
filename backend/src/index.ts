import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { UserModel } from "./models/user.model.js"
import {z} from "zod"
import { dbConnect } from "./db.js"
import mongoose from "mongoose"
import { authMiddleware } from "./authmiddleware.js"
import { ContentModel } from "./models/content.model.js"

const app = express()
app.use(express.json())

app.post("/api/v1/signup" , async(req, res) =>{
    // zod validation
    const requireObject = z.object({
        username : z.string().min(3).max(10),
        password : z.string().min(3).max(15)
    })

    const ParseData = requireObject.safeParse(req.body)

    if(!ParseData.success){
        return res.status(411).json({
            message : "error in inputs"
        })
    }

    const username = ParseData.data.username
    const password = ParseData.data.password

    const userExist = await UserModel.findOne({
        username : username
    })
    try {
        if(userExist){
            return res.status(403).json({
                message : "username already exists"
            })
        }
    
        const hashPassword = await bcrypt.hash(password, 10)

        await UserModel.create({
            username : username,
            password : hashPassword
        })
        
        return res.status(200).json({
            message: "signed up"
        })
        
    } catch (error) {
        return res.status(500).json({
            message : "server error"

        })
    }
})

app.post('/api/v1/signin', async(req, res) =>{
    const signinSchema = z.object({
        username : z.string().min(3).max(10),
        password : z.string().min(3).max(15)
    })

    const ParseData = signinSchema.safeParse(req.body)

    if(!ParseData.success){
        return res.status(403).json({
            message : "error in inputs"
        })
    }

    const username = ParseData.data.username
    const password = ParseData.data.password

    try {
        const user = await UserModel.findOne({
            username : username
        })

        if(!user){
            return res.status(403).json({
                message : "invalid username or password"
            })
        }
    
        const isPassValid = await bcrypt.compare(password, user?.password!)
    
        if(!isPassValid){
            return res.status(403).json({
                message : "invalid username or password"
            })
        }
    
        const token = jwt.sign({
            userId : user!._id
        }, process.env.JWT_SECRET!)
    
        return res.status(200).json({
            message : "sign in",
            token : token
        })
    } catch (error) {
        return res.status(500).json({
            message : "server error"
        })
    }

})

app.post('/api/v1/content', authMiddleware, async(req, res) => {
    const contentTypes = ["tweet", "video", "article"]
    const contentSchema = z.object({
        link : z.string().url(),
        type: z.enum(contentTypes as [string, ...string[]]),
        title : z.string(),
        tags: z.array(
            z.string().refine(mongoose.Types.ObjectId.isValid)
        ).optional()
    })

    const ParseData = contentSchema.safeParse(contentSchema)

    if(!ParseData.success){
        return res.status(403).json({
            message : "invalid inputs"
        })
    }

    const link = ParseData.data.link
    const type = ParseData.data.type
    const title = ParseData.data.title
    const tags = ParseData.data.tags
    //@ts-ignore
    const userId = req.userId

    await ContentModel.create({
        link : link,
        type : type,
        title : title,
        tags : tags,
        createdBy : userId
    })



})

const PORT = process.env.PORT || 4000
async function serverStart(){
    try {
        await dbConnect()
        console.log("monogdb connected")
    
        app.listen(PORT)
        console.log(`server is listening on PORT ${PORT}`)
    } catch (error) {
        console.error("failed to start server" , error)
        process.exit(1)
    }
}

serverStart()