import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
    restaurant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Restaurant',
        required:[true,"Restaurant Id is required"]
    },
    name:{
        type:String,
        required:[true,'Item name is required'],
        trim:true
    },
    description:{
        type:String,
        default:""
    },
    price:{
        type:Number,
        required:[true,"Price is required"],
        min:0
    },
    category:{
        type:String,
        required:[true,"Category is required"]
    },
    isAvailable:{
        type:Boolean,
        default:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    image:{
        type:String,
        default:""
    }
},{
    timestamps:true
})

const menuModel = mongoose.model("Menu",menuItemSchema);

export default menuModel