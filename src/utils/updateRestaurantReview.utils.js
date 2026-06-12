import reviewModel from "../models/review.models.js";
import restaurantModel from "../models/restaurant.models.js";
import mongoose from "mongoose";


const updateRestaurantRating = async (restaurantId) => {
    const stats = await reviewModel.aggregate([
        {
            $match: {
                restaurant: new mongoose.Types.ObjectId(restaurantId)
            }
        },
        {
            $group: {
                _id: "$restaurant",
                avgRating: {
                    $avg: "$rating"
                },
                reviewCount: {
                    $sum: 1
                }
            },
        }

    ])

    if (stats.length === 0) {
        const review = await restaurantModel.findByIdAndUpdate(restaurantId,{
            averageRating:0,
            reviewCount:0
        })

        return 
    }

    await restaurantModel.findByIdAndUpdate(restaurantId,{
            averageRating:Number(stats[0].avgRating.toFixed(1)),
            reviewCount:stats[0].reviewCount
        })

        return
    
}


export default updateRestaurantRating