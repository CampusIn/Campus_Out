import marketPlaceCategoryModel from "../models/marketPlaceCategory.models.js";
import marketPlaceOrderModel from "../models/marketPlaceOrders.models.js";
import marketPlaceProductsModel from "../models/marketPlaceProducts.models.js";

const MARKETPLACE_DASHBOARD_STATUSES = [
  "PENDING",
  "DELIVERED",
  "CANCELLED",
  "CONFIRMED",
];

const getMarketplaceOverviewPipeline = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const [
    revenueStats,
    todaysRevenueStats,
    completedOrders,
    productsListed,
    categories,
  ] =
    await Promise.all([
      marketPlaceOrderModel.aggregate([
        {
          $match: {
            orderStatus: "DELIVERED",
          },
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: "$pricing.finalAmount",
            },
          },
        },
      ]),

      marketPlaceOrderModel.aggregate([
        {
          $match: {
            orderStatus: "DELIVERED",
            createdAt: {
              $gte: todayStart,
              $lt: tomorrowStart,
            },
          },
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: "$pricing.finalAmount",
            },
          },
        },
      ]),

      marketPlaceOrderModel.countDocuments({
        orderStatus: "DELIVERED",
      }),

      marketPlaceProductsModel.countDocuments(),

      marketPlaceCategoryModel
        .find({})
        .sort({
          priority: -1,
          createdAt: -1,
        })
        .select("name -_id"),
    ]);

  return {
    revenue: revenueStats[0]?.revenue || 0,
    todaysRevenue: todaysRevenueStats[0]?.revenue || 0,
    completedOrders,
    productsListed,
    categories: categories.map((category) => category.name),
  };
};

const getMarketplaceOrderStatusPipeline = async () => {
  const orderStatusStats = await marketPlaceOrderModel.aggregate([
    {
      $match: {
        orderStatus: {
          $in: MARKETPLACE_DASHBOARD_STATUSES,
        },
      },
    },
    {
      $group: {
        _id: "$orderStatus",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        orderStatus: "$_id",
        count: 1,
      },
    },
  ]);

  return MARKETPLACE_DASHBOARD_STATUSES.map((status) => {
    const statusData = orderStatusStats.find(
      (item) => item.orderStatus === status,
    );

    return {
      orderStatus: status,
      count: statusData?.count || 0,
    };
  });
};

const getMarketplaceRevenueChartPipeline = async () => {
  const revenueChart = await marketPlaceOrderModel.aggregate([
    {
      $match: {
        orderStatus: "DELIVERED",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        revenue: {
          $sum: "$pricing.finalAmount",
        },
        orders: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        revenue: 1,
        orders: 1,
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
  ]);

  return revenueChart;
};

const getTopMarketplaceProductsPipeline = async () => {
  const topProducts = await marketPlaceOrderModel.aggregate([
    {
      $match: {
        orderStatus: "DELIVERED",
      },
    },
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: "$items.product",
        productName: {
          $first: "$items.productName",
        },
        productImage: {
          $first: "$items.productImage",
        },
        totalSold: {
          $sum: "$items.quantity",
        },
        totalRevenue: {
          $sum: {
            $multiply: ["$items.priceAtPurchase", "$items.quantity"],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        productName: 1,
        productImage: 1,
        totalSold: 1,
        totalRevenue: 1,
      },
    },
    {
      $sort: {
        totalSold: -1,
        totalRevenue: -1,
      },
    },
    {
      $limit: 5,
    },
  ]);

  return topProducts;
};

const getTopMarketplaceCategoriesPipeline = async () => {
  const topCategories = await marketPlaceOrderModel.aggregate([
    {
      $match: {
        orderStatus: "DELIVERED",
      },
    },
    {
      $group: {
        _id: "$category",
        categoryName: {
          $first: "$categoryName",
        },
        totalOrders: {
          $sum: 1,
        },
        totalRevenue: {
          $sum: "$pricing.finalAmount",
        },
      },
    },
    {
      $project: {
        _id: 0,
        categoryId: "$_id",
        categoryName: 1,
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

  return topCategories;
};

const getMarketplaceInventoryPipeline = async () => {
  const [lowStockItems, outOfStockItems] = await Promise.all([
    marketPlaceProductsModel
      .find({
        stock: {
          $gt: 0,
          $lte: 5,
        },
      })
      .populate({
        path: "category",
        select: "name",
      })
      .select("_id name stock price images category isActive")
      .sort({
        stock: 1,
        createdAt: -1,
      }),

    marketPlaceProductsModel
      .find({
        stock: 0,
      })
      .populate({
        path: "category",
        select: "name",
      })
      .select("_id name stock price images category isActive")
      .sort({
        createdAt: -1,
      }),
  ]);

  return {
    lowStockCount: lowStockItems.length,
    outOfStockCount: outOfStockItems.length,
    lowStockItems,
    outOfStockItems,
  };
};

export {
  getMarketplaceOverviewPipeline,
  getMarketplaceOrderStatusPipeline,
  getMarketplaceRevenueChartPipeline,
  getTopMarketplaceProductsPipeline,
  getTopMarketplaceCategoriesPipeline,
  getMarketplaceInventoryPipeline,
};
