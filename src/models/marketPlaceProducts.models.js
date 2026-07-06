import mongoose from "mongoose";

const marketPlaceProductsSchema = new mongoose.Schema({
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'MarketPlaceCategory',
        required:true
    },
    name:{
        type:String,
        trim:true,
        required:[true,'Name is required'],
    },
    description:{
        type:String,
        trim:true,
        required:[true,'Description is required']
    },
    price:{
        type:Number,
        min:0,
        required:[true,'Price is required']
    },
    stock:{
        type:Number,
        min:0,
        default:0
    },
    images:[{
        type:String,
        required:[true,'Images are required']
    }],
    condition:{
        type:String,
        enum:[
            'NEW',
            'LIKE_NEW',
            'GOOD',
            'FAIR'
        ],
        default:'NEW'
    },
    isActive:{
        type:Boolean,
        default:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    sellerPhoneNumber:{
        type:String,
        default:null
    }
},{
    timestamps:true
})

marketPlaceProductsSchema.index({
    category:1,
    isActive:1
})

marketPlaceProductsSchema.index({
    createdBy:1
})

marketPlaceProductsSchema.index({
    name:'text'
})

marketPlaceProductsSchema.index({
    category:1,
    price:1
})

marketPlaceProductsSchema.index(
  { category: 1, name: 1 },
  { unique: true }
);
const marketPlaceProductsModel = mongoose.model('MarketPlaceProduct',marketPlaceProductsSchema)

export default marketPlaceProductsModel