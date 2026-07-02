import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: [true, "Username must be unique"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email already exists"],
  },
  password: {
    type: String,
    required: function () {
      return this.authProvider === "local";
    },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "vendor", "admin", "delivery_partner"],
    required: [true, "Role is required"],
    default: "user",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  googleId:{
    type:String,
    default:null
  },
  profilePicture:{
    type:String,
    default:null
  },
  authProvider:{
    type:String,
    enum:['google','local'],
    default:'local'
  }
});

const userModel = mongoose.model("User", userSchema);

export default userModel;
