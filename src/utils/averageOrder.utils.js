import orderModel from "../models/order.models.js";

const averageOrderPipeline = async (restaurantId) => {
  const averageOrderValue = await orderModel.aggregate([
    {
      $match: {
        restaurant: restaurantId,
        orderStatus: "DELIVERED",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: "$totalAmount",
        },
        totalOrders: {
          $sum: 1,
        },
      },
    },
  ]);

  const totalRevenue = averageOrderValue[0]?.totalRevenue || 0;
  const totalOrders = averageOrderValue[0]?.totalOrders || 0;
  const averageValue = +(totalRevenue / totalOrders).toFixed(2);

  return {
    averageValue,
    totalRevenue,
    totalOrders,
  };
};

export default averageOrderPipeline;
