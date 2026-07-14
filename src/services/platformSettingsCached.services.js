import { REDIS_KEYS } from "../constants/redis.constants.js"
import redisServices from "./redis.services.js"
const platformSettingsCached = async ()=>{
    const cachedSettings = await redisServices.get(REDIS_KEYS.PLATFORM_SETTINGS)
    if(cachedSettings){
        return cachedSettings
    }

    return null
}

const setPlatformSettingsCached = async(platformSettings)=>{
    await redisServices.set(REDIS_KEYS.PLATFORM_SETTINGS,platformSettings)
}

const deletePlatformSettingsCached = async()=>{
    await redisServices.remove(REDIS_KEYS.PLATFORM_SETTINGS)
}
export  {
    platformSettingsCached,
    setPlatformSettingsCached,
    deletePlatformSettingsCached
}