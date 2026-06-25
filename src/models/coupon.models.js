import mongoose, { disconnect } from "mongoose";

const couponSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true,
        uppercase:true,
        trim:true
    },
    discountType:{
        type:String,
        enum:['PERCENTAGE','FIXED'],
        required:true
    },
    discountValue:{
        type:Number,
        required:true,
        min:[1,'Discount value must be greater than 0']
    },
    minimumOrderValue:{
        type:Number,
        default:0,
        min:[0,'Minimum order value cannot be negative']
    },
    maximumDiscount:{
        type:Number,
        default:0,
        min:[0,'Maximum discount value cannot be negative']
    },
    expiryDate:{
        type:Date,
        required:true
    },
    usageLimit:{
        type:Number,
        required:true,
        min:[1,'Usage limit should be greater than 0']
    },
    usageCount:{
        type:Number,
        default:0
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{
    timestamps:true
})

const couponModel = mongoose.model('Coupon',couponSchema)

export default couponModel