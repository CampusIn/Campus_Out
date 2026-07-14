import { REDIS_KEYS } from "../constants/redis.constants.js";
import redisServices from "./redis.services.js";

const getRestaurantMenuCached = async(restaurantId)=>{
    const cachedData = await redisServices.get(REDIS_KEYS.MENU_KEY(restaurantId))
    if(cachedData){
        return cachedData
    }
    return null
}

const setRestaurantMenuCached = async(restaurantId,menu)=>{
    await redisServices.set(REDIS_KEYS.MENU_KEY(restaurantId),menu,600)
}

const deleteRestaurantMenuCached = async(restaurantId)=>{
    await redisServices.remove(REDIS_KEYS.MENU_KEY(restaurantId))
}

export {
    getRestaurantMenuCached,
    setRestaurantMenuCached,
    deleteRestaurantMenuCached
}