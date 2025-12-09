import mongoose from "mongoose";

const linkSchema = new mongoose.Schema({
    hash : {
        type : String
    },
    userId : {
        type : mongoose.Types.ObjectId,
        ref : "user"
    }
})

export const LinkModel = mongoose.model("link", linkSchema)
