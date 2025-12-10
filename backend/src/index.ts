import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { UserModel } from "./models/user.model.js"
import {z} from "zod"
import { dbConnect } from "./db.js"
import mongoose from "mongoose"
import { authMiddleware } from "./authmiddleware.js"
import { ContentModel } from "./models/content.model.js"
import { LinkModel } from "./models/link.model.js"


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

app.post('/api/v1/content', authMiddleware, async(req, res) =>{
    const contentTypes = ["image", "video", "article", "audio"]
    const contentSchema = z.object({
        link : z.string(),
        type: z.enum(contentTypes as [string, ...string[]]),
        title : z.string(),
        tags: z.array(
            z.string().refine(mongoose.Types.ObjectId.isValid)
        ).optional()
    })

    const ParseData = contentSchema.safeParse(req.body)

    if(!ParseData.success){
        return res.status(403).json({
            message : "invalid inputs"
        })
    }

    const link = ParseData.data.link
    const type = ParseData.data.type
    const title = ParseData.data.title
    const tags = ParseData.data.tags?.map(tag => new mongoose.Types.ObjectId(tag)) || []
    //@ts-ignore
    const userId = req.userId

    try {
        await ContentModel.create({
            link : link,
            type : type,
            title : title,
            tags : tags,
            createdBy : userId
        })
    
        return res.status(201).json({
            message : "content uploaded"
        })
    } catch (error) {
        return res.status(500).json({
            message : "server error"
        })
    }

})

app.get('/api/v1/content', authMiddleware, async(req, res) => {
    //@ts-ignore
    const createdBy = req.userId

    try {
        const content = await ContentModel.find({
            createdBy : createdBy
        })
    
        return res.status(200).json({
            content : content
        })
    } catch (error) {
        return res.status(500).json({
            message : "server error"
        })
    }


})

app.delete('/api/v1/content', authMiddleware, async(req, res) => {
    //@ts-ignore
    const createdBy = req.userId
    const contentId = req.body.contentId

    if(!mongoose.Types.ObjectId.isValid(contentId)){
        return res.status(400).json({
            message : "invalid content id"
        })
    }

    try {
        const result = await ContentModel.deleteOne({
            createdBy : createdBy,
            _id : contentId
        })

        if(result.deletedCount === 0){
            return res.status(404).json({
                message : "content not found"
            })
        }
    } catch (error) {
        return res.status(500).json({
            message : "server error"
        })
    }

})

app.post('/api/v1/brain/share', authMiddleware, async(req, res) => {
    //@ts-ignore
    const userId = req.userId
    const share = req.body.share

    if (share){
        const shareHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

        try {
            await LinkModel.create({
                hash: shareHash,
                userId: userId
            })
    
            return res.status(201).json({
                shareLink: `/api/v1/brain/${shareHash}`
            })
        } catch (error) {
            return res.status(500).json({
                message : "server error"
            })
        }
    }else{
        try {
            await LinkModel.deleteOne({
                userId: userId
            })
    
            return res.status(201).json({
                message : "sharelink deleted"
            })
        } catch (error) {
            return res.status(500).json({
                message : "server error"
            })
        }
    }
    
})

app.get('/api/v1/brain/:sharelink', async(req, res) => {
    const sharelink = req.params.sharelink
    
    try {
        const link = await LinkModel.findOne({
            hash: sharelink
        })
        
        if(!link){
            return res.status(404).json({
                message: "share link not found"
            })
        }

        const content = await ContentModel.find({
            createdBy: link.userId as unknown as mongoose.Types.ObjectId
        })
        
        return res.status(200).json({
            content: content
        })
    } catch (error) {
        return res.status(500).json({
            message: "failed to fetch shared brain"
        })
    }
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