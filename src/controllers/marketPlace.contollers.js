import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import marketPlaceCategoryModel from "../models/marketPlaceCategory.models.js";

const getAllCategoriesByUser = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 5 } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 5;
  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Invalid page number or limit number");
  }
  const skip = (pageNumber - 1) * limitNumber;
  let filter = {isActive:true};
  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  
  const [categories, totalCategories] = await Promise.all([
    marketPlaceCategoryModel
      .find(filter)
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .select('name description image priority _id')
      .skip(skip)
      .limit(limitNumber),

    marketPlaceCategoryModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCategories / limitNumber);
  if (categories.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, "No categories to fetch", {
        categories,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalCategories,
          totalPages,
        },
      }),
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Categories fetched successfully", {
      categories,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalCategories,
        totalPages,
      },
    }),
  );
});


export default {
    getAllCategoriesByUser
}