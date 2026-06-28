import orderModel from "../models/order.models.js";

const getRevenueStats = async () => {
  const revenueStats = await orderModel.aggregate([
    {
      $match: {
        orderStatus: "DELIVERED",
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: {
          $sum: "$totalAmount",
        },
      },
    },
  ]);

  return revenueStats[0]?.totalAmount || 0;
};

export default getRevenueStats;
