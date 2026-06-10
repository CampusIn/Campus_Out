import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import orderModel from "../models/order.models.js";
import cartModel from '../models/cart.models.js';
import userModel from "../models/user.models.js";
import restaurantModel from "../models/restaurant.models.js";
import generateOrderNumber from "../utils/orderNumber.utils.js";

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
    if(pageNumber<1 || limitNumber<1){
        throw new ApiError(404,"Invalid page number or limit number")
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

    return res.status(200).json(new ApiResponse(200, "Order history fetched successfuly",{
        orders,
        "pagination": {
            "page": pageNumber,
            "limit": limitNumber,
            totalOrders,
            totalPages

        }
    }))
})

export default {
    createOrder,
    getAllOrders
}