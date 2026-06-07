import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import menuModel from "../models/menuItem.models.js";
import restaurantModel from "../models/restaurant.models.js" ;
import mongoose from "mongoose";

const createMenuItem = asyncHandler(async(req,res)=>{
    const {restaurantId} = req.params
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        throw new ApiError(400, "Invalid restaurant ID")
    }
    const restaurant = await restaurantModel.findById(restaurantId)
    if(!restaurant){
        throw new ApiError(404,"Restaurant not found")
    } 

    if(restaurant.owner.toString() !== req.user.id.toString()){
        throw new ApiError(403,"Forbidden")
    }
    const {name,description,price,category,image} = req.body
    const menuCreated = await menuModel.create({
        restaurant:restaurantId,
        name,
        description,
        price,
        category,
        image
    })
    return res.status(201).json(new ApiResponse(201, menuCreated, "Menu item created successfully"))
});

const getRestaurantMenu = asyncHandler(async(req,res)=>{
    const{restaurantId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(restaurantId)){
        throw new ApiError(400,"Invalid restaurant ID")
    }
    const restaurant = await restaurantModel.findById(restaurantId)
    if(!restaurant){
        throw new ApiError(404,"Restaurant not found")
    }

    const menuItems = await menuModel.find({
        restaurant:restaurantId,
        isDeleted:false
    })

    return res.status(200).json(new ApiResponse(200,"Menu fetched successfuly",menuItems))
});

const getMenuItemById = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Id not found")
    }
    const menuItem = await menuModel.findOne({
        _id:id,
        isDeleted:false
    })
    if(!menuItem){
        throw new ApiError(404,"Menu item not found")
    }

    return res.status(200).json(new ApiResponse(200,"Menu items fetched successfuly",menuItem))
})

export default { 
    createMenuItem,
    getRestaurantMenu,
    getMenuItemById
}