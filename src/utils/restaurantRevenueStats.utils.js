import orderModel from "../models/order.models.js";

const restaurantRevenueStats = async (restaurantId) => {
  const revenueStats = await orderModel.aggregate([
    {
      $match: {
        restaurant: restaurantId,
        orderStatus: "DELIVERED",
      },
    },
    {
      $group: {
        _id: null,
        revenue: {
          $sum: "$totalAmount",
        },
      },
    },
  ]);

  return revenueStats[0]?.revenue || 0;
};

export default restaurantRevenueStats;
