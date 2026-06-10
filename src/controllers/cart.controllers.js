import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import cartModel from "../models/cart.models.js";
import menuModel from "../models/menuItem.models.js";
import cartTotal from "../utils/cartTotal.js";
import mongoose from 'mongoose';

const addToCart = asyncHandler(async (req, res) => {
    const { menuItemId, quantity } = req.body
    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
        throw new ApiError(400, "Invalid menu item id")
    }
    if (quantity < 1) {
        throw new ApiError(400, "Invalid Quantity")
    }

    const menu = await menuModel.findById(menuItemId)
    if (!menu) {
        throw new ApiError(404, "Menu not found")
    }
    if (!menu.isAvailable) {
        throw new ApiError(400, "Item currently unavailable")
    }

    let cart = await cartModel.findOne({
        user: req.user.id,
    })

    if (!cart) {
        cart = await cartModel.create({
            user: req.user.id,
            restaurant: menu.restaurant,

        })
    }

    if (cart.restaurant.toString() !== menu.restaurant.toString()) {
        throw new ApiError(409, "Items are from different restaurants.Remove the items for proceeding")
    }

    const existingItem = cart.items.find((item) => {
        return item.menuItem.toString() === menuItemId.toString()
    })

    if (existingItem) {
        existingItem.quantity += quantity
    } else {
        cart.items.push({
            menuItem: menuItemId,
            quantity
        })
    }

    const finalCart = await cartTotal(cart)

    return res.status(201).json(new ApiResponse(201, "Items added to cart", finalCart))
});

//debug this
const getItemsFromCart = asyncHandler(async (req, res) => {
    let cart = await cartModel.findOne({
        user: req.user.id
    }).populate({
        path: 'restaurant',
        select: 'restaurantName'
    })

    if (!cart) {
        return res.status(200).json(new ApiResponse(200, "No items in the cart", cart = {
            restaurant: null,
            items: [],
            totalAmount: 0
        }))
    }

    await cart.populate({
        path: 'items.menuItem',
        select: 'name price image'
    })

    cart.items = cart.items.filter((item) => {
        if (item.menuItem) return item
    })

    const menuIdOnly = cart.items.map(item => item.menuItem._id)
    const menus = await menuModel.find({
        _id: {
            $in: menuIdOnly
        }
    })



    const calculatedAmount = cart.items.reduce((sum, item) => {
        const menu = menus.find(menu => menu._id.toString() === item.menuItem._id.toString())
        if (!menu) throw new ApiError(400, "One or more items in your cart is not available")
        const finalPrice = item.quantity * menu.price
        return sum + finalPrice
    }, 0)

    cart.totalAmount = calculatedAmount
    await cart.save()


    return res.status(200).json(new ApiResponse(200, "Cart fetched successfuly", {
        "restaurant": cart.restaurant,
        "items": cart.items,
        "totalAmount": cart.totalAmount

    }))

});

const updateCartItemQuantity = asyncHandler(async (req, res) => {
    const { menuItemId } = req.params
    const { quantity } = req.body
    if (quantity < 1) {
        throw new ApiError(400, "Inavlid quantity")
    }
    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
        throw new ApiError(400, "Menu Item Id is not valid")
    }

    const cart = await cartModel.findOne({
        user: req.user.id
    })
    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    const item = cart.items.find((item) => {
        if (item.menuItem.toString() === menuItemId) {
            return item
        }
    })

    if (!item) {
        throw new ApiError(404, "No such item in the cart")
    }

    item.quantity = quantity

    const finalCart = await cartTotal(cart)



    return res.status(200).json(new ApiResponse(200, "Quantity updated", {
        "items": finalCart.items,
        "totalAmount": finalCart.totalAmount
    }))
});

const deleteCartItem = asyncHandler(async (req, res) => {
    const { menuItemId } = req.params
    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
        throw new ApiError(400, "Invalid Menu Item ID")
    }
    const cart = await cartModel.findOne({
        user: req.user.id
    })

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    const itemPos = cart.items.findIndex((item) => menuItemId === item.menuItem.toString())

    if (itemPos === -1) {
        throw new ApiError(404, "Item not found in cart")
    }
    cart.items.splice(itemPos, 1)
    if (cart.items.length === 0) {
        await cart.deleteOne({ user: req.user.id })
        return res.status(200).json(new ApiResponse(200, "Item deleted successfuly", {
            "restaurant": null,
            "items": [],
            "totalAmount": 0
        }))
    }

    const finalCart = await cartTotal(cart)
    return res.status(200).json(new ApiResponse(200, "Item deleted successfuly", finalCart))
});

const deleteCart = asyncHandler(async (req, res) => {
    const cart = await cartModel.findOne({
        user:req.user.id
    })

    if(!cart){
        throw new ApiError(404,"Cart not found")
    }

    await cart.deleteOne({user:req.user.id})
    return res.status(200).json(new ApiResponse(200,"Cart deleted successfuly"))
});

export default {
    addToCart,
    getItemsFromCart,
    updateCartItemQuantity,
    deleteCartItem,
    deleteCart
}