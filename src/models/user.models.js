import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,'Username is required'],
        unique:[true,'Username must be unique']
    },
    email:{
        type:String,
        required:[true,'email is required'],
        unique:[true,'email already exists']
    },
    password:{
        type:String,
        required:[true,'Password is required']
    },
    verified:{
        type:Boolean,
        default:false
    },
    role:{
        type:String,
        enum:['user','vendor','admin'],
        required:[true,'Role is required'],
        default:'user'
    }
})

const userModel = mongoose.model('User',userSchema);

export default userModel