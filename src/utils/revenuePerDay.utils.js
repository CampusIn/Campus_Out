import orderModel from "../models/order.models.js";


const revenuePerDayPipeline = async (restaurantId) => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const revenuePerDay = await orderModel.aggregate([
        {
            $match: {
                restaurant: restaurantId,
                orderStatus: 'DELIVERED',
                createdAt: {
                    $gte: sevenDaysAgo
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: '$createdAt'
                    }
                },
                revenue: {
                    $sum: '$totalAmount'
                }

            }
        },
        {
            $project: {
                _id: 0,
                date: '$_id',
                revenue: 1
            }
        },
        {
            $sort: {
                date: 1
            }
        }
    ])

    return revenuePerDay
}


export default revenuePerDayPipeline