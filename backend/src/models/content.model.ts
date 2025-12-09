import mongoose from "mongoose";

const contentTypes = ["image", "video", "article", "audio"]

const contentSchema = new mongoose.Schema({
    link : {
        type : String,
        required : true
    },
    type : {
        type : String,
        enum : contentTypes,
        required : true
    }, 
    title : {
        type : String,
        required : true
    },
    tags : [{
        type : mongoose.Types.ObjectId,
        ref : "tag"
    }],
    createdBy : {
        type : mongoose.Types.ObjectId,
        ref :  "user",
        required : true
    }
})

export const ContentModel = mongoose.model("content", contentSchema)