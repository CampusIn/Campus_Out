import { REDIS_KEYS } from "../constants/redis.constants.js";

export function otpKey (email) {
    return `${REDIS_KEYS.OTP}:${email}`
}