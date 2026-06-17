import reviewModel from '../models/review.models.js';
import restaurantModel from '../models/restaurant.models.js';
import orderModel from "../models/order.models.js"
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiErrors.js';
import ApiResponse from '../utils/apiResponse.js';
import updateRestaurantRating from "../utils/updateRestaurantReview.utils.js"
import mongoose from "mongoose";
import { response } from 'express';

const createReview = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params
    const { rating, comment } = req.body
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        throw new ApiError(400, "Invalid Restaurant ID")
    }

    if (rating < 1 || rating > 5) {
        throw new ApiError(400, "Invalid rating")
    }

    const restaurant = await restaurantModel.findById(restaurantId)
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found")
    }

    const order = await orderModel.findOne({
        user: req.user.id,
        restaurant: restaurantId,
        orderStatus: "DELIVERED"
    })

    if (!order) {
        throw new ApiError(403, "Order before reviewing")
    }

    const existingReview = await reviewModel.findOne({
        user: req.user.id,
        restaurant: restaurantId
    })
    if (existingReview) {
        throw new ApiError(409, "You already reviewed this restaurant")
    }

    const review = await reviewModel.create({
        user: req.user.id,
        restaurant: restaurantId,
        rating,
        comment
    })

    await updateRestaurantRating(restaurantId)

    return res.status(201).json(new ApiResponse(201, "Rating created successfully", review))
});

const getAllReview = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        throw new ApiError(400, "Restaurant Id is invalid")
    }

    const restaurant = await restaurantModel.findById(restaurantId)
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found")
    }
    const averageRating = restaurant.averageRating
    const reviewCount = restaurant.reviewCount

    const { page = 1, limit = 10 } = req.query
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 10
    if (pageNumber < 1 || limitNumber < 1) {
        throw new ApiError(404, "Invalid page number or limit number")
    }
    const skip = (pageNumber - 1) * limitNumber

    const reviews = await reviewModel.find({
        restaurant: restaurantId
    })
        .populate({
        path: "user",
        select: "username -_id"
    })
        .sort({ "createdAt": -1 })
        .select({
            __v:0,restaurant:0
        })
        .skip(skip)
        .limit(limitNumber)
    const totalReviews = await reviewModel.countDocuments({restaurant:restaurantId})
    const totalPages = Math.ceil(totalReviews / limitNumber)
    if (reviews.length === 0) {
        return res.status(200).json(new ApiResponse(200, "No reviews", {
            averageRating,
            reviewCount,
            "reviews": [],
            "pagination": {
                "page": pageNumber,
                "limit": limitNumber,
                totalReviews,
                totalPages

            }
        }))
    }

    return res.status(200).json(new ApiResponse(200, "Reviews fetched successfuly", {
        averageRating,
        reviewCount,
        reviews,
        "pagination": {
            "page": pageNumber,
            "limit": limitNumber,
            totalReviews,
            totalPages

        }
    }))
});

const updateReview = asyncHandler(async(req,res) =>{
    const {reviewId} = req.params
    if(!mongoose.Types.ObjectId.isValid(reviewId)){
        throw new ApiError(400,"Review Id is invalid")
    }

    const review = await reviewModel.findById(reviewId)
    if(!review){
        throw new ApiError(404,"Review not found")
    }

    if(review.user.toString() !== req.user.id){
        throw new ApiError(403,"This review is not done by you")
    }
    const {rating = review.rating , comment = review.comment } = req.body

    if(rating<1 || rating>5){
        throw new ApiError(400,"Rating shoud be between 1 and 5")
    }
    const restaurantId = review.restaurant
    review.rating = rating
    review.comment = comment
    await review.save()
    await updateRestaurantRating(restaurantId)

    return res.status(200).json(new ApiResponse(200,"Review updated successfuly",review))

});

const deleteReview = asyncHandler(async(req,res) =>{
    const {reviewId} = req.params
    if(!mongoose.Types.ObjectId.isValid(reviewId)){
        throw new ApiError(400,"Review ID is invalid")
    }

    const review = await reviewModel.findById(reviewId)
    if(!review){
        throw new ApiError(404,"No reviews found")
    }

    if(review.user.toString()!==req.user.id){
        throw new ApiError(403,"Forbidden")
    }

    const restaurantId = review.restaurant
    await review.deleteOne()
    await updateRestaurantRating(restaurantId)

    const restaurant = await restaurantModel.findById(restaurantId)
    const {averageRating,reviewCount} = restaurant
    return res.status(200).json(new ApiResponse(201,"Reviews deleted successfully",{
        averageRating,
        reviewCount
    }))

})

export default {
    createReview,
    getAllReview,
    updateReview,
    deleteReview
}