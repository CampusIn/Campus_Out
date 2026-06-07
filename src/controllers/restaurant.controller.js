import restaurantModel from "../models/restaurant.models.js";
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiErrors.js';
import ApiResponse from '../utils/apiResponse.js';
import mongoose from "mongoose";

const createRestaurant = asyncHandler(async (req, res) => {
    const { restaurantName, phone, description, location, category } = req.body;
    const newRestaurant = await restaurantModel.create({
        owner: req.user.id,
        restaurantName,
        description,
        category,
        phone,
        location
    })

    if (!newRestaurant) {
        throw new ApiError("Failed to create restaurant", 500);
    }

    return res.status(201).json(new ApiResponse(201, "Restaurant created successfully", newRestaurant));

});

const updateRestaurant = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, "Bad Request")
    }
    const restaurant = await restaurantModel.findById(req.params.id);
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }
    if (restaurant.owner.toString() !== req.user.id.toString()) {
        throw new ApiError(403, "Not allowed");
    }
    const allowedFields = [
        "restaurantName",
        "description",
        "category",
        "phone",
        "email",
        "logo",
        "banner",
        "location",
        "deliveryTime",
        "minimumOrder",
        "isOpen"
    ];

    const filteredBody = {};
    allowedFields.forEach(field => {
        if(req.body[field]!==undefined){
            filteredBody[field] = req.body[field]
        }
    })
    const updatedRestaurant = await restaurantModel.findByIdAndUpdate(
        req.params.id,
        filteredBody,
        { returnDocument: 'after' }
    )

    return res.status(200).json(new ApiResponse(200, 'Updated the restaurant', updatedRestaurant))
});

const getMyRestaurants = asyncHandler(async (req, res) => {

    const restaurant = await restaurantModel.find(
        { owner: req.user.id }
    )

    return res.status(200).json(new ApiResponse(200, "The fetched restaurants are", restaurant))
});
//debug this
const getRestaurantById = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, "Bad Request")
    }
    const restaurant = await restaurantModel.findById(
        req.params.id
    )
    if (!restaurant) {
        throw new ApiError(404, "Restaurant Not Found")
    }

    if (restaurant.owner.toString() !== req.user.id.toString()) {
        throw new ApiError(403, "Not authorised")
    }


    return res.status(200).json(new ApiResponse(200, "Restaurant fetched successfully", restaurant))
});

const dltRestaurantById = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, "Bad Request")
    }
    const restaurant = await restaurantModel.findById(req.params.id)

    if (!restaurant) {
        throw new ApiError(404, 'Restaurant not found')
    }

    if (restaurant.owner.toString() !== req.user.id.toString()) {
        throw new ApiError(403, "Not authorised")
    }
    await restaurantModel.findByIdAndDelete(req.params.id)
    return res.status(200).json(new ApiResponse(200, '', 'Restaurant is deleted'))
});

const updateRestaurantStatus = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, "Bad Request")
    }
    const restaurant = await restaurantModel.findById(req.params.id)
    if (!restaurant) {
        throw new ApiError(404, 'Restaurant not found')
    }
    if (restaurant.owner.toString() !== req.user.id.toString()) {
        throw new ApiError(403, "Not authorised")
    }
    

    restaurant.isOpen = req.body.isOpen
    await restaurant.save()
    return res.status(200).json(new ApiResponse(200, restaurant))
})


export default {
    createRestaurant,
    updateRestaurant,
    getMyRestaurants,
    getRestaurantById,
    dltRestaurantById,
    updateRestaurantStatus
}