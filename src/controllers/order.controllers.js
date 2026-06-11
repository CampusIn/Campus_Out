import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import orderModel from "../models/order.models.js";
import cartModel from '../models/cart.models.js';
import userModel from "../models/user.models.js";
import restaurantModel from "../models/restaurant.models.js";
import generateOrderNumber from "../utils/orderNumber.utils.js";
import mongoose from "mongoose";

//User order section Start
const createOrder = asyncHandler(async (req, res) => {
    const { paymentMethod } = req.body
    if (paymentMethod !== "COD" && paymentMethod !== "PAY_ON_PICKUP") {
        throw new ApiError(400, "Choose a payment method")
    }

    const cart = await cartModel.findOne({
        user: req.user.id
    }).populate({
        path: 'items.menuItem'
    })

    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty")
    }

    cart.items.forEach((item) => {
        if (!item.menuItem) {
            throw new ApiError(400, "One or more items no longer exists")
        }
        if (!item.menuItem.isAvailable) {
            throw new ApiError(400, "One or more items are not available")
        }
    })

    const restaurantId = cart.restaurant
    const restaurant = await restaurantModel.findById(restaurantId)
    if (!restaurant) {
        throw new ApiError(404, "No such restaurant exists")
    }
    const restaurantName = restaurant.restaurantName

    const orderItems = cart.items.map((item) => {
        const menuItem = item.menuItem._id
        const itemName = item.menuItem.name
        const priceAtPurchase = item.menuItem.price
        const quantity = item.quantity
        return { menuItem, itemName, priceAtPurchase, quantity }

    })
    const totalAmount = orderItems.reduce((total, item) => {
        const itemPrice = item.priceAtPurchase * item.quantity
        return total + itemPrice
    }, 0)

    const order = await orderModel.create({
        user: req.user.id,
        restaurant: restaurantId,
        restaurantName,
        items: orderItems,
        totalAmount,
        orderNumber: generateOrderNumber(),
        paymentMethod
    })

    await cartModel.findOneAndDelete({ user: req.user.id })
    return res.status(200).json(new ApiResponse(200, "Order created successful", order))




});

const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 10
    if (pageNumber < 1 || limitNumber < 1) {
        throw new ApiError(404, "Invalid page number or limit number")
    }
    const skip = (pageNumber - 1) * limitNumber
    const totalOrders = await orderModel.countDocuments({ user: req.user.id })
    if (totalOrders === 0) {
        return res.status(200).json(new ApiResponse(200, "No order found", {
            "orders": []
        }))
    }
    const orders = await orderModel
        .find({ user: req.user.id }, "orderNumber restaurantName totalAmount orderStatus createdAt")
        .sort({ "createdAt": -1 })
        .skip(skip)
        .limit(limitNumber)


    const totalPages = Math.ceil(totalOrders / limitNumber)
    if (orders.length === 0) {
        return res.status(200).json(new ApiResponse(200, "No order found", {
            "orders": [],
            "pagination": {
                "page": pageNumber,
                "limit": limitNumber,
                totalOrders,
                totalPages

            }
        }))

    }

    return res.status(200).json(new ApiResponse(200, "Order history fetched successfuly", {
        orders,
        "pagination": {
            "page": pageNumber,
            "limit": limitNumber,
            totalOrders,
            totalPages

        }
    }))
});

const getSingleOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new ApiError(400, "Inavlid order Id")
    }

    const order = await orderModel
        .findById(orderId)
        .select("user orderNumber restaurantName items paymentMethod paymentStatus orderStatus totalAmount createdAt")
    if (!order) {
        throw new ApiError(404, "Order not found")
    }
    if (order.user.toString() !== req.user.id) {
        throw new ApiError(403, "Forbidden")
    }

    return res.status(200).json(new ApiResponse(200, "Order details fetched successfuly", order))
});

const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new ApiError(400, "Invalid Order")
    }
    const order = await orderModel.findById(orderId)
    if (!order) {
        throw new ApiError(404, "Order does not exist")
    }
    console.log(order.user.toString())
    console.log(req.user.id)
    if (order.user.toString() !== req.user.id) {
        throw new ApiError(403, " Forbidden")
    }
    if (order.orderStatus !== "PENDING") {
        throw new ApiError(409, "Only pending orders can be cancelled")
    }
    order.orderStatus = "CANCELLED"
    await order.save()
    return res.status(200).json(new ApiResponse(200, "Order has been cancelled", order))
})

//User order section Finished

//Vendor order section Start

const getVendorOrder = asyncHandler(async (req, res) => {

    const restaurant = await restaurantModel.findOne({ owner: req.user.id })
    if (!restaurant) {
        throw new ApiError(404, "No restaurant found")
    }

    const { page = 1, limit = 10 } = req.query
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 10
    if (pageNumber < 1 || limitNumber < 1) {
        throw new ApiError(400, "Invalid page number or limit number")
    }
    const skip = (pageNumber - 1) * limitNumber

    const totalOrders = await orderModel.countDocuments({ restaurant: restaurant._id })
    const totalPages = Math.ceil(totalOrders / limitNumber)
    const orders = await orderModel
        .find({ restaurant: restaurant._id })
        .sort({ "createdAt": -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate({
            path: "user",
            select: "username"
        })


    if (orders.length === 0) {
        return res.status(200).json(new ApiResponse(200, "No orders to show", {
            "orders": [],
            "pagination": {
                "page": pageNumber,
                "limit": limitNumber,
                totalOrders,
                totalPages
            }
        }))
    }

    return res.status(200).json(new ApiResponse(200, "Orders fetched succesfuly", {
        orders,
        "pagination": {
            "page": pageNumber,
            "limit": limitNumber,
            totalOrders,
            totalPages
        }
    }))
});

const changeOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const { orderStatus } = req.body
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new ApiError(400, "Inavlid Order Id")
    }
    const allowedStatus = [
        "CONFIRMED",
        "PREPARING",
        "READY",
        "DELIVERED"
    ]

    const isValidStatus = allowedStatus.includes(orderStatus)
    if(!isValidStatus){
        throw new ApiError(400,"Invalid Order status")
    }

    const order = await orderModel.findById(orderId).populate({
        path:'restaurant',
        select:'owner'
    })
    if(!order){
        throw new ApiError(404,"Order not found")
    }
    if(order.restaurant.owner.toString() !== req.user.id){
        throw new ApiError(403,"Forbidden, you are not the owner of restaurant")
    }

    if(order.orderStatus === "DELIVERED"){
        throw new ApiError(409,"Order is delivered,no more changes can be made")
    }
    order.orderStatus = orderStatus
    await order.save()
    return res.status(200).json(new ApiResponse(200,"Order status updated successfuly",{
        "orderNumber":order.orderNumber,
        "orderStatus":order.orderStatus
    }))
});
//Vendor order section Finished

export default {
    createOrder,
    getAllOrders,
    getSingleOrder,
    cancelOrder,
    getVendorOrder,
    changeOrderStatus
    
}