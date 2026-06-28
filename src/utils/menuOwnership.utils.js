import menuModel from "../models/menuItem.models.js";
import ApiError from "./apiErrors.js";

const verifyMenuOwnership = async (menuId, userId) => {
  const menuItem = await menuModel.findById(menuId).populate("restaurant");
  if (!menuItem.restaurant) {
    throw new ApiError(404, "Restaurant Not Found");
  }
  if (!menuItem || menuItem.isDeleted) {
    throw new ApiError(404, "menu not found");
  }

  if (menuItem.restaurant.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Forbidden");
  }

  return menuItem;
};

export { verifyMenuOwnership };
