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

const LinkModel = mongoose.model("link", linkSchema)

module.exports = {
    LinkModel : LinkModel
}