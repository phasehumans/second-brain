import type {Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"

export const authMiddleware = (req: Request, res: Response, next :NextFunction) => {
    const authHeader = req.headers.authorization

    if(!authHeader){
        return res.status(401).json({
            message : "unauthorized"
        })
    }

    try {
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET!)
    
        if(decoded){
            //@ts-ignore
            req.userId = (decoded as any).userId
            next()
        }
    } catch (error) {
        return res.status(401).json({
            message : "invalid token"
        })
    }
}