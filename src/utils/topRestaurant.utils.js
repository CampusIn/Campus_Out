import orderModel from "../models/order.models.js";

const topRestaurantsPipeline = async () => {
  const topRestaurants = await orderModel.aggregate([
    {
      $match: {
        orderStatus: "DELIVERED",
      },
    },
    {
      $group: {
        _id: "$restaurant",
        totalOrders: {
          $sum: 1,
        },
        totalRevenue: {
          $sum: "$totalAmount",
        },
      },
    },
    {
      $lookup: {
        from: "restaurants",
        localField: "_id",
        foreignField: "_id",
        as: "restaurantDetails",
      },
    },
    {
      $unwind: "$restaurant",
    },
    {
      $project: {
        _id: 0,
        restaurantName: "$restaurantDetails.restaurantName",
        totalOrders: 1,
        totalRevenue: 1,
      },
    },
    {
      $sort: {
        totalRevenue: -1,
        totalOrders: -1,
      },
    },
    {
      $limit: 5,
    },
  ]);

  return topRestaurants;
};

export default topRestaurantsPipeline;
