import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import marketPlaceCategoryModel from "../models/marketPlaceCategory.models.js";
import marketPlaceProductsModel from "../models/marketPlaceProducts.models.js";
import mongoose from "mongoose";

const getAllCategoriesByUser = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 5 } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 5;
  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Invalid page number or limit number");
  }
  const skip = (pageNumber - 1) * limitNumber;
  let filter = { isActive: true };
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
      .select("name description image priority _id")
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

const getAllProductsByUser = asyncHandler(async (req, res) => {
  let filter = {
    isActive: true,
    stock: { $gt: 0 },
  };

  const {
    search,
    category,
    condition,
    maxPrice,
    minPrice,
    page = 1,
    limit = 5,
  } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 5;
  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Page number or limit number is invalid");
  }
  const skip = (pageNumber - 1) * limitNumber;
  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  if (category) {
    filter.category = category
  }

  if (condition) {
    filter.condition = condition;
  }

  if(minPrice || maxPrice){
    if (minPrice) {
    filter.price = { $gte: Number(minPrice) };
  }

  if (maxPrice) {
    filter.price = { $lte: Number(maxPrice) };
  }
  }
  const [products, totalProducts] = await Promise.all([
    marketPlaceProductsModel
      .find(filter)
      .sort({ createdAt: -1, price: -1 })
      .select("_id name price images condition category")
      .skip(skip)
      .limit(limitNumber),

    marketPlaceProductsModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalProducts / limitNumber);
  if (products.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, "No products to fetch", {
        products,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalProducts,
          totalPages,
        },
      }),
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Products fetched successfully", {
      products,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalProducts,
        totalPages,
      },
    }),
  );
});

const getProductsByIdUser = asyncHandler(async(req,res)=>{
  const{productId} = req.params
  if(!mongoose.Types.ObjectId.isValid(productId)){
    throw new ApiError(400,"Product ID is not valid")
  }

  const product = await marketPlaceProductsModel
    .findOne({
      _id:productId,
      isActive:true,
      stock:{$gt:0}
    })
    .populate(
      {
        path:'category',
        select:'name'
      })
      .select("-createdBy -createdAt -updatedAt")
  if(!product){
    throw new ApiError(404,"Product not found ")
  }

  return res.status(200).json(new ApiResponse(200,"Product fetched successfully",product))


});

export default {
  getAllCategoriesByUser,
  getAllProductsByUser,
  getProductsByIdUser
};
