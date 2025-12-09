import { Types } from "mongoose";
import mongoose from "mongoose";

const contentTypes = ["image", "video", "article", "audio"]

interface contentDoc{
    link: string;
    type: string;
    title: string;
    tags: Types.ObjectId[];
    createdBy: Types.ObjectId;
}

const contentSchema = new mongoose.Schema<contentDoc>({
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

export const ContentModel = mongoose.model<contentDoc>("content", contentSchema)