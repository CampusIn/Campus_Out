import redisServices from "./redis.services.js";
import bcrypt from "bcrypt";
import { otpKey } from "../utils/redisKey.utils.js";
import { OTP_EXPIRY } from "../constants/redis.constants.js";

const storeOTP = async(email, OTP)=>{
    const hashedOTP = await bcrypt.hash(OTP,10)
    const redisKey = otpKey(email)
    await redisServices.set(redisKey,hashedOTP,OTP_EXPIRY)
}

const verifyOTP = async(email,OTP)=>{
    const redisKey = otpKey(email)
    const hashedOTP = await redisServices.get(redisKey)
    if(!hashedOTP)
        {return false}
    const isVerified = await bcrypt.compare(OTP,hashedOTP)
    if(!isVerified)
        {return false}

    await redisServices.remove(redisKey)
    return true
}

export default {
    storeOTP,
    verifyOTP
}
