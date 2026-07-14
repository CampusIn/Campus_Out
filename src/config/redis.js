import Redis from "ioredis";
import config from "../config/config.js"

const redis = new Redis(config.REDIS_URL,{
    maxRetriesPerRequest: null,
    enableReadyCheck:true,
    lazyConnect:false
})

redis.on("connect",()=>{
    console.log("Redis connected successfully");
})

redis.on("ready",()=>{
    console.log("Redis is ready to use");
})

redis.on("error",(err)=>{
    console.log("Redis connection error:", err.message);
})

redis.on("close",()=>{
    console.log("Redis connection closed");
})

export {redis};