import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true

    },

    description:{
        type:String,
        required:true
    },

    priority:{
        type:Number,
        default:1
    },
    expiresAt:Date,

    isActive:{
        type:Boolean,
        default:true
    },

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }

})

const announcementModel = mongoose.model('Anouncement',announcementSchema)

export default announcementModel