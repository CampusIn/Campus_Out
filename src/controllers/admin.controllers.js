import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import userModel from "../models/user.models.js";
import restaurantModel from "../models/restaurant.models.js";
import orderModel from "../models/order.models.js";
import getRevenueStats from "../utils/revenueStats.utils.js";
import platformSettingsModel from "../models/platformSettings.models.js";
import couponModel from "../models/coupon.models.js";
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

const getOrderById = asyncHandler(async (req, res) => {
    const orderId = req.params.id
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new ApiError(400, 'Invalid OrderID')
    }

    const order = await orderModel
        .findById(orderId)
        .populate([
            {
                path: 'user',
                select: 'username'
            },
            {
                path: 'items.menuItem',
                select: 'name price image'
            }
        ])
    if (!order) {
        throw new ApiError(404, 'Order not found')
    }

    return res.status(200).json(new ApiResponse(200, 'Order fetched successfully', { order }))
});

const configSettings = asyncHandler(async (req, res) => {
    let settings = await platformSettingsModel.findOne()
    if (!settings) {
        settings = await platformSettingsModel.create({})
    }

    return res.status(200).json(new ApiResponse('Settings configured successfully', settings))
});

const editSettings = asyncHandler(async (req, res) => {
    const settings = await platformSettingsModel.findOne()
    if (!settings) {
        throw new ApiError(404, 'Platform settings not found')
    }

    const updates = req.body


    Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
            settings[key] = value;
        }
    });

    if (settings.freeDeliveryAbove < settings.minimumOrderValue) {
        throw new ApiError(400, 'Minimum order value cannot be above free delivery order value')
    }

    settings.updatedBy = req.user.id
    await settings.save()

    return res.status(200).json(new ApiResponse(200, 'Settings updated successfully', settings))
});

const createCoupons = asyncHandler(async (req, res) => {
    let {
        code,
        discountType,
        discountValue,
        minimumOrderValue,
        maximumDiscount,
        expiryDate,
        usageLimit
    } = req.body

    const normalisedCode = code.trim().toUpperCase()
    const isExisting = await couponModel.findOne({code:normalisedCode})
    if(isExisting){
        throw new ApiError(409,'Coupon already exists')
    }

    const expiry = new Date(expiryDate)
    if(expiry<=new Date()){
        throw new ApiError(400,'Coupon already expired')
    }


    if(discountType==='PERCENTAGE' && maximumDiscount<=0){
        throw new ApiError(400,'Maximum discount is required for percentage coupons')
    }
    if(discountType === 'PERCENTAGE'){
        if(discountValue>100){
            throw new ApiError(400,'Percentage cannot exceed 100%')
        }
    }else if(discountType === 'FIXED'){
        maximumDiscount = 0
    }


    const coupon = await couponModel.create({
        normalisedCode,
        discountType,
        discountValue,
        minimumOrderValue,
        maximumDiscount,
        expiryDate,
        usageLimit,
        createdBy:req.user.id
    })

    return res.status(201).json(new ApiResponse(201,'Coupon created successfully',coupon))
});

const getAllCoupons = asyncHandler(async(req,res)=>{
    const{
        search,
        isActive,
        discountType,
        page = 1,
        limit = 5
    } = req.query

    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 5
    if(pageNumber<1 || limitNumber<1){
        throw new ApiError(400,'Page or limit number cannot be less than 1')
    }

    const skip = (pageNumber - 1)*limitNumber
    let filter = {}
    if(search){
        filter.code={
            $regex:search,
            $options:'i'
        }
    }

    if(isActive === 'true'){
        filter.isActive = true
    }else if(isActive === 'false'){
        filter.isActive = false
    }

    const allowedTypes = ['PERCENTAGE','FIXED']

    if(discountType){
        if(!discountType.includes(allowedTypes)){
            throw new ApiError(400,'Invalid discount type')
        }
        filter.discountType = discountType
    }

    const [coupons, totalCoupons] = await Promise.all([
        couponModel
            .find(filter)
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limitNumber)
            .populate({
                path:'createdBy',
                select:'username'
            }),

        couponModel.countDocuments(filter)

    ])

    const totalPages = Math.ceil(totalCoupons/limitNumber)

    if(coupons.length === 0 ){
        return res.status(200).json(new ApiResponse(200,'No coupons to fetch',{
            coupons,
            'pagination':{
                'page':pageNumber,
                'limit':limitNumber,
                totalCoupons,
                totalPages
            }
        }))
    }

    return res.status(200).json(new ApiResponse(200,'Coupons fetched successfully',{
        coupons,
        'pagination':{
            'page':pageNumber,
            'limit':limitNumber,
            totalCoupons,
            totalPages
        }
    }))
});

const getCouponById = asyncHandler(async(req,res)=>{
    const {couponId} = req.params
    if(!mongoose.Types.ObjectId.isValid(couponId)){
        throw new ApiError(400,'Invalid coupon ID')
    }

    const coupon = await couponModel
        .findById(couponId)
        .populate({
            path:'createdBy',
            select:'username'
        })
    if(!coupon){
        throw new ApiError(404,'Coupon not found')
    }

    return res.status(200).json(new ApiResponse(200,'Coupon fetched successfully',coupon))

});

const updateCoupon = asyncHandler(async(req,res)=>{
    const{couponId} = req.params
    if(!mongoose.Types.ObjectId.isValid(couponId)){
        throw new ApiError(400,'Invalid coupon ID`')
    }

    const coupon = await couponModel.findById(couponId)
    if(!coupon){
        throw new ApiError(404,'Coupon not found')
    }

    const updates = req.body

    if(updates.code){
        const normalisedCode = updates.code.trim().toUpperCase()
        const isExisting = await couponModel.findOne({
            code:normalisedCode,
            _id:{$ne:couponId}
        })

        if(isExisting){
            throw new ApiError(409,'Coupon already exists')
        }
    }

    Object.entries(updates).forEach(([key,value])=>{
        if(value !== undefined){
            coupon[key] = value
        }
    })

    const expiry =new Date(coupon.expiryDate)
    if(expiry <= new Date()){
        throw new ApiError(400,'Coupon already expired')
    }

    if(coupon.discountType === 'PERCENTAGE'){
        if(coupon.discountValue > 100) throw new ApiError(400,'Discount value cannot be greater than 100')
        
        if(coupon.maximumDiscount < 1) throw new ApiError(400,'Maximum discount anount should be greater than 0')
    }else if(coupon.discountType === 'FIXED'){
        coupon.maximumDiscount = 0
    }

    await coupon.save()

    return res.status(200).json(new ApiResponse(200,'Coupon updated successfully',coupon))

    
});

const updateCouponStatus = asyncHandler(async(req,res)=>{
    const{couponId} = req.params
    if(!mongoose.Types.ObjectId.isValid(couponId)){
        throw new ApiError(400,'Coupon ID is invalid')
    }
    const coupon = await couponModel.findById(couponId)
    if(!coupon){
        throw new ApiError(404,'Coupon is not existing')
    }

    coupon.isActive = !coupon.isActive
    await coupon.save()

    return res.status(200).json(new ApiResponse(200,'Coupon status updated successfully',{
        'currentCouponState':coupon.isActive
    }))
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
    getOrderById,
    configSettings,
    editSettings,
    createCoupons,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    updateCouponStatus
}