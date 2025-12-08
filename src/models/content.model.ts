import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    link : {
        type : String,
        required : true
    },
    type : {
        type : String,
        required : true
    }, 
    title : {
        type : String,
        required : true
    },
    tags : {
        type : mongoose.Types.ObjectId,
        ref : "tag"
    },
    createdBy : {
        type : mongoose.Types.ObjectId,
        ref :  "user"
    }
})

const ContentModel = mongoose.model("content", contentSchema)

module.exports = {
    ContentModel : ContentModel
}