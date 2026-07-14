import { REDIS_KEYS } from "../constants/redis.constants.js";
import redisServices from "./redis.services.js";

const getRestaurantCached = async(id)=>{
    const cachedData = await redisServices.get(REDIS_KEYS.RESTAURANT_KEY(id))
    if(cachedData){
        return cachedData
    }
    return null
}

const setRestaurantCached = async(id,restaurantData)=>{
    await redisServices.set(REDIS_KEYS.RESTAURANT_KEY(id),restaurantData,600)
}

const deleteRestaurantCached = async(id)=>{
    await redisServices.remove(REDIS_KEYS.RESTAURANT_KEY(id))
}

export {
    getRestaurantCached,
    setRestaurantCached,
    deleteRestaurantCached
}