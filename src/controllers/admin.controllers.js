import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import userModel from "../models/user.models.js";
import restaurantModel from "../models/restaurant.models.js";
import orderModel from "../models/order.models.js";
import getRevenueStats from "../utils/revenueStats.utils.js";
import mongoose from "mongoose";

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

const viewUsers = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 5 } = req.query
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 5
    if (pageNumber < 1 || limitNumber < 1) {
        throw new ApiError(400, 'Invalid page number or limit number')
    }
    const skip = (pageNumber - 1) * limitNumber
    let filter = {
        role: 'user'
    }
    if (search) {
        filter.username = {
            $regex: search,
            $options: 'i'
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

    const totalPages = Math.ceil(totalUsers / limitNumber)

    return res.status(200).json(new ApiResponse(200, 'User details fetched successfuly', {
        users: matchedUsers,
        "pagination": {
            "page": pageNumber,
            "limit": limitNumber,
            totalUsers,
            totalPages
        }
    }))


});

const viewVendors = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 5 } = req.query
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 5
    if (pageNumber < 1 || limitNumber < 1) {
        throw new ApiError(400, 'Invalid page number or limit number')
    }
    const skip = (pageNumber - 1) * limitNumber
    let filter = {
        role: 'vendor'
    }
    if (search) {
        filter.username = {
            $regex: search,
            $options: 'i'
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

    const totalPages = Math.ceil(totalVendor / limitNumber)

    return res.status(200).json(new ApiResponse(200, 'Vendor details fetched successfuly', {
        venodors: matchedVendors,
        "pagination": {
            "page": pageNumber,
            "limit": limitNumber,
            totalVendor,
            totalPages
        }
    }))


});

const viewRestaurants = asyncHandler(async (req, res) => {
    const { search, category, isOpen, page = 1, limit = 5 } = req.query
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 5
    if (pageNumber < 1 || limitNumber < 1) {
        throw new ApiError(400, 'Invalid page number or limit number')
    }
    const skip = (pageNumber - 1) * limitNumber
    let filter = {}
    if (search) {
        filter.restaurantName = {
            $regex: search,
            $options: 'i'
        }
    }
    if (isOpen === 'true') {
        filter.isOpen = true
    }
    else if (isOpen === 'false') {
        filter.isOpen = false
    }
    if (category) {
        filter.category = category
    }

    const [matchedRestaurants, totalRestaurants] = await Promise.all([
        restaurantModel
            .find(filter)
            .skip(skip)
            .limit(limitNumber),

        restaurantModel.countDocuments(filter)
    ])

    const totalPages = Math.ceil(totalRestaurants / limitNumber)

    return res.status(200).json(new ApiResponse(200, 'Restaurant details fetched successfully', {
        'restaurants': matchedRestaurants,
        'pagination': {
            'page': pageNumber,
            'limit': limitNumber,
            totalRestaurants,
            totalPages
        }
    }))

});

const blockUser = asyncHandler(async (req, res) => {
    const userId = req.params.id
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(404, 'Invalid User ID')
    }

    const user = await userModel.findByIdAndUpdate(userId, {
        isBlocked: true
    })

    if (!user) {
        throw new ApiError(404, 'User not found')
    }

    return res.status(200).json(new ApiResponse(200, 'User blocked successfully'))
});

const unBlockUser = asyncHandler(async (req, res) => {
    const userId = req.params.id
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(404, 'Invalid User ID')
    }

    const user = await userModel.findByIdAndUpdate(userId, {
        isBlocked: false
    })

    if (!user) {
        throw new ApiError(404, 'User not found')
    }

    return res.status(200).json(new ApiResponse(200, 'User un-blocked successfully'))
});

const suspendRestaurant = asyncHandler(async (req, res) => {
    const restaurantId = req.params.id
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        throw new ApiError(404, 'Inavlid restaurant ID')
    }

    const restaurant = await restaurantModel.findByIdAndUpdate(restaurantId, {
        isSuspended: true
    })

    if (!restaurant) {
        throw new ApiError(404, 'Restaurant not found')
    }

    return res.status(200).json(200, 'Restuarant suspended successfully')
});

const activateRestaurant = asyncHandler(async (req, res) => {
    const restaurantId = req.params.id
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        throw new ApiError(400, 'Inavlid restaurant ID')
    }

    const restaurant = await restaurantModel.findByIdAndUpdate(restaurantId, {
        isSuspended: false
    })

    if (!restaurant) {
        throw new ApiError(404, 'Restaurant not found')
    }

    return res.status(200).json(new ApiResponse(200, 'Restuarant activated successfully'))
});

const getAllOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 5 } = req.query
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 5
    if (pageNumber < 1 || limitNumber < 1) {
        throw new ApiError(400, 'Invalid Page number or Limit number')
    }
    const skip = (pageNumber - 1) * limitNumber
    let filter = {}
    const validateStatus = [
        'PENDING',
        'ACCEPTED',
        'PREPARING',
        'READY',
        'DELIVERED',
        'CANCELLED'
    ]

    if (status && !validateStatus.includes(status)) {
        throw new ApiError(400, 'Invalid status')
    } else if (status && validateStatus.includes(status)) {
        filter.orderStatus = status
    }

    const [orders, totalOrders] = await Promise.all([
        orderModel
            .find(filter)
            .skip(skip)
            .limit(limitNumber)
            .populate(
                {
                    path: 'user',
                    select: 'username'
                }
            ).sort({ createdAt: -1 }),

        orderModel.countDocuments(filter)
    ])

    const totalPages = Math.ceil(totalOrders / limitNumber)

    return res.status(200).json(new ApiResponse(200, 'Order details fetched successfully', {
        orders,
        'pagination': {
            'page': pageNumber,
            'limit': limitNumber,
            totalOrders,
            totalPages,

        }
    }))
});

const getOrderById = asyncHandler(async(req,res) =>{
    const orderId = req.params.id
    if(!mongoose.Types.ObjectId.isValid(orderId)){
        throw new ApiError(400,'Invalid OrderID')
    }

    const order = await orderModel
        .findById(orderId)
        .populate([
            {
            path:'user',
            select:'username'
        },
        {
            path:'items.menuItem',
            select:'name price image'
        }
    ])
    if(!order){
        throw new ApiError(404,'Order not found')
    }

    return res.status(200).json(new ApiResponse(200,'Order fetched successfully',{order}))
})



export default {
    viewAdminDashboard,
    viewUsers,
    viewVendors,
    viewRestaurants,
    blockUser,
    unBlockUser,
    suspendRestaurant,
    activateRestaurant,
    getAllOrders,
    getOrderById
}