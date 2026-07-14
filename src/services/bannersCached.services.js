import {REDIS_KEYS} from "../constants/redis.constants.js";
import redisServices from "./redis.services.js";

const getBannerCached = async()=>{
    const cachedData = await redisServices.get(REDIS_KEYS.BANNERS)
    if(cachedData){
        return cachedData
    }

     return null
}

const setBannerCached = async(banner)=>{
    await redisServices.set(REDIS_KEYS.BANNERS,banner,600)
}

const deletedBannerCached = async()=>{
    await redisServices.remove(REDIS_KEYS.BANNERS)
}

export {
    getBannerCached,
    setBannerCached,
    deletedBannerCached
}