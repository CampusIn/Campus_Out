import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import cartModel from "../models/cart.models.js";
import menuModel from "../models/menuItem.models.js";
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

    if(existingItem){
        existingItem.quantity += quantity
    }else{
        cart.items.push({
            menuItem:menuItemId,
            quantity
        })
    }

    const menuIdOnly = cart.items.map(item=>item.menuItem)
    const menus = await menuModel.find({
        _id:{
            $in:menuIdOnly
        }
    })

    const calculatedAmount = cart.items.reduce((sum,item)=>{
        const menu = menus.find(menu=>menu._id.toString() === item.menuItem.toString())
        if(!menu) throw new ApiError(400,"One or more items in your cart is not available")
        const finalPrice = item.quantity * menu.price
        return sum + finalPrice
    },0)

    cart.totalAmount = calculatedAmount
    await cart.save()

    return res.status(201).json(new ApiResponse(201,"Items added to cart",cart))
})
export default {
    addToCart
}