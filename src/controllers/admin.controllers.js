import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import userModel from "../models/user.models.js";
import restaurantModel from "../models/restaurant.models.js";
import orderModel from "../models/order.models.js";
import getRevenueStats from "../utils/revenueStats.utils.js";

const viewAdminDashboard = asyncHandler(async (req, res) => {
        const [
        userCount,
        vendorCount,
        restaurantCount,
        orderCount,
        revenue
    ] = await Promise.all([
        userModel.countDocuments({ role: 'user' }),
        userModel.countDocuments({ role: 'vendor' }),
        restaurantModel.countDocuments(),
        orderModel.countDocuments(),
        getRevenueStats()

    ])


    return res.status(200).json(new ApiResponse(200, 'Dashboard details fetched successfully', {
        userCount,
        vendorCount,
        restaurantCount,
        orderCount,
        revenue
    }))
});

const viewUsers = asyncHandler(async (req,res) =>{
    const{ search, page = 1,limit =5} = req.query
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 5
    if(pageNumber <1 || limitNumber <1){
        throw new ApiError(400,'Invalid page number or limit number')
    }
    const skip = (pageNumber - 1)*limitNumber
    let filter ={
        role:'user'
    }
    if(search){
       filter.username = {
                $regex:search,
                $options:'i'
            }

    }
    const [matchedUsers, totalUsers] = await Promise.all([
        userModel
        .find(filter)
        .skip(skip)
        .limit(limitNumber)
        .select('-password'),

        userModel.countDocuments(filter)

    ])

    const totalPages = Math.ceil(totalUsers/limitNumber)

    return res.status(200).json(new ApiResponse(200,'User details fetched successfuly',{
        users:matchedUsers,
        "pagination":{
            "page":pageNumber,
            "limit":limitNumber,
            totalUsers,
            totalPages
        }
    }))

    
});

const viewVendors = asyncHandler(async (req,res) =>{
    const{ search, page = 1,limit =5} = req.query
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 5
    if(pageNumber <1 || limitNumber <1){
        throw new ApiError(400,'Invalid page number or limit number')
    }
    const skip = (pageNumber - 1)*limitNumber
    let filter ={
        role:'vendor'
    }
    if(search){
       filter.username = {
                $regex:search,
                $options:'i'
            }

    }
    const [matchedVendors, totalVendor] = await Promise.all([
        userModel
        .find(filter)
        .skip(skip)
        .limit(limitNumber)
        .select('-password'),

        userModel.countDocuments(filter)

    ])

    const totalPages = Math.ceil(totalVendor/limitNumber)

    return res.status(200).json(new ApiResponse(200,'Vendor details fetched successfuly',{
        venodors:matchedVendors,
        "pagination":{
            "page":pageNumber,
            "limit":limitNumber,
            totalVendor,
            totalPages
        }
    }))

    
});

const viewRestaurants = asyncHandler(async (req,res)=>{
    const{search,category,isOpen,page=1,limit=5} = req.query
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 5
    if(pageNumber<1 || limitNumber <1){
        throw new ApiError(400,'Invalid page number or limit number')
    }
    const skip = (pageNumber - 1) * limitNumber
    let filter = {}
    if(search){
        filter.restaurantName = {
            $regex:search,
            $options:'i'
        }
    }
    if(isOpen === 'true'){
        filter.isOpen = true
    }
    else if(isOpen === 'false'){
        filter.isOpen = false
    }
    if(category){
        filter.category = category
    }

    const [matchedRestaurants, totalRestaurants] = await Promise.all([
        restaurantModel
        .find(filter)
        .skip(skip)
        .limit(limitNumber),

        restaurantModel.countDocuments(filter)
    ])

    const totalPages = Math.ceil(totalRestaurants/limitNumber)

    return res.status(200).json(new ApiResponse(200,'Restaurant details fetched successfully',{
        'restaurants':matchedRestaurants,
        'pagination':{
            'page':pageNumber,
            'limit':limitNumber,
            totalRestaurants,
            totalPages
        }
    }))

})

export default {
    viewAdminDashboard,
    viewUsers,
    viewVendors,
    viewRestaurants
}