import { REDIS_KEYS } from "../constants/redis.constants.js";
import redisServices from "./redis.services.js";

const normaliseSearch = (search) => search?.trim().toLowerCase() || "all";

const getCategoryCacheKey = ({ page, limit, search }) => {
  return REDIS_KEYS.CATEGORIES(page, limit, normaliseSearch(search));
};

const getCategoriesCached = async ({ page, limit, search }) => {
  const cachedData = await redisServices.get(
    getCategoryCacheKey({ page, limit, search }),
  );
  if (cachedData) {
    return cachedData;
  }

  return null;
};

const setCategoriesCached = async ({ page, limit, search }, category) => {
  await redisServices.set(
    getCategoryCacheKey({ page, limit, search }),
    category,
    600,
  );
};

const deletedCategoriesCached = async () => {
  await redisServices.removeByPattern(REDIS_KEYS.CATEGORIES_PATTERN);
};

export { getCategoriesCached, setCategoriesCached, deletedCategoriesCached };
