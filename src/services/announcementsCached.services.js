import {REDIS_KEYS} from "../constants/redis.constants.js";
import redisServices from "./redis.services.js";

const getAnnouncementsCached = async()=>{
    const cachedData = await redisServices.get(REDIS_KEYS.ANNOUNCEMENTS)
    if(cachedData){
        return cachedData
    }
    return null
}

const setAnnouncementsCached = async(announcements)=>{
    await redisServices.set(REDIS_KEYS.ANNOUNCEMENTS,announcements,600)
}

const deleteAnnouncementsCached = async()=>{
    await redisServices.remove(REDIS_KEYS.ANNOUNCEMENTS)
}

export {
    getAnnouncementsCached,
    setAnnouncementsCached,
    deleteAnnouncementsCached
}