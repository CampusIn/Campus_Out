import mongoose from "mongoose";

const repairPartnerSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:[true,"Name is required"]
    },
    phoneNumber:{
        type:String,
        required:[true,"Phone number is required"],
        unique:true
    },
    specialisations:{
        type:[String],
        enum:[
            "MOBILE",
            "LAPTOP",
            "COOLERS",
            "OTHERS"
        ],
        required:[true,"Specialisations are required"]
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true
})


repairPartnerSchema.index({
    isActive:1
});

repairPartnerSchema.index({
    specialisations:1,
    isActive:1
});
const repairPartnerModel = mongoose.model("RepairPartner",repairPartnerSchema)

export default repairPartnerModel