import mongoose, { Mongoose } from "mongoose";

const marketPlaceCategorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Category name is required'],
        trim: true
    },
    description:{
        type:String,
        trim:true
    },
    image:{
        type:String,
        required:[true,'Image is required']
    },
    priority:{
        type:Number,
        default:1
    },
    isActive:{
        type:Boolean,
        default:true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{
    timestamps:true
})

marketPlaceCategorySchema.index({
    name:1
},{
    unique:true
})

marketPlaceCategorySchema.index({
    priority:-1,
    createdAt:-1
})

const marketPlaceCategoryModel = mongoose.model('MarketPlaceCategory',marketPlaceCategorySchema)

export default marketPlaceCategoryModel