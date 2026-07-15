import { REDIS_KEYS } from "../constants/redis.constants.js";
import redisServices from "./redis.services.js";

const normaliseCacheValue = (value) => {
    if (value === undefined || value === null || value === "") {
        return "all"
    }

    return encodeURIComponent(String(value).trim().toLowerCase()) || "all"
}

const getRestaurantListCacheKey = ({ page, limit, search, category }) => {
    return REDIS_KEYS.RESTAURANTS(
        page,
        limit,
        normaliseCacheValue(search),
        normaliseCacheValue(category)
    )
}

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

const getRestaurantsCached = async(params)=>{
    const cachedData = await redisServices.get(getRestaurantListCacheKey(params))
    if(cachedData){
        return cachedData
    }
    return null
}

const setRestaurantsCached = async(params,restaurantData)=>{
    await redisServices.set(getRestaurantListCacheKey(params),restaurantData,600)
}

const deleteRestaurantCached = async(id)=>{
    if(id){
        await redisServices.remove(REDIS_KEYS.RESTAURANT_KEY(id))
    }
    await redisServices.removeByPattern(REDIS_KEYS.RESTAURANTS_PATTERN)
}

export {
    getRestaurantCached,
    setRestaurantCached,
    getRestaurantsCached,
    setRestaurantsCached,
    deleteRestaurantCached
}
