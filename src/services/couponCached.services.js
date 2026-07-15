import { REDIS_KEYS } from "../constants/redis.constants.js";
import redisServices from "./redis.services.js";

const getCouponCached = async ()=>{
    const cachedData = await redisServices.get(REDIS_KEYS.COUPON)
    if(cachedData){
        return cachedData
    }

    return null
}

const setCouponCached = async(coupon)=>{
    await redisServices.set(REDIS_KEYS.COUPON,coupon,300)
}

const deleteCouponCached = async()=>{
    await redisServices.remove(REDIS_KEYS.COUPON)
}

export {
    getCouponCached,
    setCouponCached,
    deleteCouponCached
}