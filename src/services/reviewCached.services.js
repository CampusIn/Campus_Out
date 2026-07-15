import { REDIS_KEYS } from "../constants/redis.constants.js";
import redisServices from "./redis.services.js";

const getReviewCacheKey = ({ restaurantId, page, limit }) => {
  return REDIS_KEYS.REVIEW(restaurantId, page, limit);
};

const getReviewsCached = async (params) => {
  const cachedData = await redisServices.get(getReviewCacheKey(params));
  if (cachedData) {
    return cachedData;
  }

  return null;
};

const setReviewsCached = async (params, reviews) => {
  await redisServices.set(getReviewCacheKey(params), reviews, 600);
};

const deleteReviewsCached = async (restaurantId) => {
  await redisServices.removeByPattern(REDIS_KEYS.REVIEW_PATTERN(restaurantId));
};

export { getReviewsCached, setReviewsCached, deleteReviewsCached };
