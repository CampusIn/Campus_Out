import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import menuModel from "../models/menuItem.models.js";
import restaurantModel from "../models/restaurant.models.js";
import { verifyMenuOwnership } from "../utils/menuOwnership.utils.js";
import mongoose from "mongoose";

const createMenuItem = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        throw new ApiError(400, "Invalid restaurant ID")
    }
    const restaurant = await restaurantModel.findById(restaurantId)
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found")
    }

    if (restaurant.owner.toString() !== req.user.id.toString()) {
        throw new ApiError(403, "Forbidden")
    }
    const { name, description, price, category, image } = req.body
    const menuCreated = await menuModel.create({
        restaurant: restaurantId,
        name,
        description,
        price,
        category,
        image
    })
    return res.status(201).json(new ApiResponse(201, menuCreated, "Menu item created successfully"))
});

const getRestaurantMenu = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        throw new ApiError(400, "Invalid restaurant ID")
    }
    const restaurant = await restaurantModel.findById(restaurantId)
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found")
    }

    const menuItems = await menuModel.find({
        restaurant: restaurantId,
        isDeleted: false
    })

    return res.status(200).json(new ApiResponse(200, "Menu fetched successfuly", menuItems))
});

const getMenuItemById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Id not found")
    }
    const menuItem = await menuModel.findOne({
        _id: id,
        isDeleted: false
    })
    if (!menuItem) {
        throw new ApiError(404, "Menu item not found")
    }

    return res.status(200).json(new ApiResponse(200, "Menu items fetched successfuly", menuItem))
});

const updateMenuItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Bad Request")
    }
    const menuItem = await verifyMenuOwnership(id, req.user.id)
    if (!restaurant) {
        throw new ApiError(404, "Restaurant Not Found")
    }

    if (restaurant.owner.toString() !== req.user.id.toString()) {
        throw new ApiError(403, "Forbidden")
    }

    const allowedFields = [
        'name',
        'description',
        'price',
        'category',
        'iamge'
    ]

    const filteredBody = {}
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            filteredBody[field] = req.body[field]
        }
    })
    const updatedMenu = await menuModel.findByIdAndUpdate(
        id,
        filteredBody,
        {
            returnDocument: "after"
        }
    )

    return res.status(200).json(new ApiResponse(200, "Menu updated successfult", updatedMenu))

});

const updateMenuStatus = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { isAvailable } = req.body
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Bad Request")
    }

    const menuItem = await verifyMenuOwnership(id, req.user.id)

    menuItem.isAvailable = isAvailable
    await menuItem.save()

    return res.status(200).json(
        new ApiResponse(200, "Availability updated successful", menuItem)
    )
});

const deleteMenuItem = asyncHandler(async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Bad Request")
    }
    const menuItem = await verifyMenuOwnership(id, req.user.id)

    menuItem.isDeleted = true
    await menuItem.save()
    return res.status(200).json(new ApiResponse(200, "Menu deleted successfuly"))
});

export default {
    createMenuItem,
    getRestaurantMenu,
    getMenuItemById,
    updateMenuItem,
    updateMenuStatus,
    deleteMenuItem
}