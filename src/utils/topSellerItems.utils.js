import orderModel from "../models/order.models.js";

const topSellerPipeline = async (restaurantId) => {
    const topSellerArray = await orderModel.aggregate([
        {
            $match: {
                restaurant: restaurantId,
                orderStatus: 'DELIVERED'
            }
        },
        {
            $unwind: '$items'
        },
        {
            $group: {
                _id: '$items.itemName',
                totalSold: {
                    $sum: '$items.quantity'
                }
            }
        }, {
            $project: {
                _id: 0,
                itemName: '$_id',
                totalSold: 1
            }
        },
        {
            $sort: {
                totalSold: -1
            }
        },
        {
            $limit: 5
        }
    ]);

    return topSellerArray
}

export default topSellerPipeline