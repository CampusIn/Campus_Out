import { redis } from "../config/redis.js";

const set = async (key, value, ttl = null) => {
  const data = typeof value === "string" ? value : JSON.stringify(value);
  if (ttl) {
    await redis.set(key, data, "EX", ttl);
  } else {
    await redis.set(key, data);
  }
};

const get = async (key) => {
  const value = await redis.get(key);
  if (!value) return null;

  try {
    JSON.parse(value);
  } catch (err) {
    return value;
  }
};


const remove = async(key)=>{
    await redis.del(key)
}

const exists = async(key)=>{
    return Boolean(await redis.exists(key))
}

const expire = async(key,ttl)=>{
    await redis.expire(key,ttl)
}

export default {
    get,
    set,
    remove,
    exists,
    expire
}