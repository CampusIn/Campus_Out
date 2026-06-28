import restaurantModel from "../models/restaurant.models.js";
import ApiError from "../utils/apiErrors.js";
import asyncHandler from "../utils/asyncHandler.js";

const restaurantSuspensionMiddleware = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const restaurant = await restaurantModel.findOne({
    owner: userId,
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  if (restaurant.isSuspended) {
    throw new ApiError(403, "Your restaurant has been suspended");
  }

  next();
});

export { restaurantSuspensionMiddleware };
