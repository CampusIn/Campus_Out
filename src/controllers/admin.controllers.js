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
import announcementModel from "../models/anouncement.models.js";
import bannerModel from "../models/banners.models.js";
import cartModel from "../models/cart.models.js";
import marketPlaceCategoryModel from "../models/marketPlaceCategory.models.js";
import marketPlaceProductsModel from "../models/marketPlaceProducts.models.js";
import { uploadOnCloudinary } from "../services/cloudinary.services.js";
import topRestaurantsPipeline from "../utils/topRestaurant.utils.js";
import generateInvoicePDF from "../services/invoice.services.js";
import { sendEmail } from "../services/email.services.js";
import reminderHTML from "../utils/reminderHTML.utils.js";
import config from "../config/config.js";

const viewAdminDashboard = asyncHandler(async (req, res) => {
  const [userCount, vendorCount, restaurantCount, orderCount, revenue] =
    await Promise.all([
      userModel.countDocuments({ role: "user" }),
      userModel.countDocuments({ role: "vendor" }),
      restaurantModel.countDocuments(),
      orderModel.countDocuments(),
      getRevenueStats(),
    ]);

  return res.status(200).json(
    new ApiResponse(200, "Dashboard details fetched successfully", {
      userCount,
      vendorCount,
      restaurantCount,
      orderCount,
      revenue,
    }),
  );
});

const viewUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 5 } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 5;
  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Invalid page number or limit number");
  }
  const skip = (pageNumber - 1) * limitNumber;
  let filter = {
    role: "user",
  };
  if (search) {
    filter.username = {
      $regex: search,
      $options: "i",
    };
  }
  const [matchedUsers, totalUsers] = await Promise.all([
    userModel.find(filter).skip(skip).limit(limitNumber).select("-password"),

    userModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalUsers / limitNumber);

  return res.status(200).json(
    new ApiResponse(200, "User details fetched successfuly", {
      users: matchedUsers,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalUsers,
        totalPages,
      },
    }),
  );
});

const viewVendors = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 5 } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 5;
  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Invalid page number or limit number");
  }
  const skip = (pageNumber - 1) * limitNumber;
  let filter = {
    role: "vendor",
  };
  if (search) {
    filter.username = {
      $regex: search,
      $options: "i",
    };
  }
  const [matchedVendors, totalVendor] = await Promise.all([
    userModel.find(filter).skip(skip).limit(limitNumber).select("-password"),

    userModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalVendor / limitNumber);

  return res.status(200).json(
    new ApiResponse(200, "Vendor details fetched successfuly", {
      venodors: matchedVendors,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalVendor,
        totalPages,
      },
    }),
  );
});

const viewRestaurants = asyncHandler(async (req, res) => {
  const { search, category, isOpen, page = 1, limit = 5 } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 5;
  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Invalid page number or limit number");
  }
  const skip = (pageNumber - 1) * limitNumber;
  let filter = {};
  if (search) {
    filter.restaurantName = {
      $regex: search,
      $options: "i",
    };
  }
  if (isOpen === "true") {
    filter.isOpen = true;
  } else if (isOpen === "false") {
    filter.isOpen = false;
  }
  if (category) {
    filter.category = category;
  }

  const [matchedRestaurants, totalRestaurants] = await Promise.all([
    restaurantModel.find(filter).skip(skip).limit(limitNumber),

    restaurantModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalRestaurants / limitNumber);

  return res.status(200).json(
    new ApiResponse(200, "Restaurant details fetched successfully", {
      restaurants: matchedRestaurants,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalRestaurants,
        totalPages,
      },
    }),
  );
});

const blockUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(404, "Invalid User ID");
  }

  const user = await userModel.findByIdAndUpdate(userId, {
    isBlocked: true,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User blocked successfully"));
});

const unBlockUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(404, "Invalid User ID");
  }

  const user = await userModel.findByIdAndUpdate(userId, {
    isBlocked: false,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User un-blocked successfully"));
});

const suspendRestaurant = asyncHandler(async (req, res) => {
  const restaurantId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new ApiError(404, "Inavlid restaurant ID");
  }

  const restaurant = await restaurantModel.findByIdAndUpdate(restaurantId, {
    isSuspended: true,
    isOpen: false,
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  return res.status(200).json(200, "Restuarant suspended successfully");
});

const activateRestaurant = asyncHandler(async (req, res) => {
  const restaurantId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new ApiError(400, "Inavlid restaurant ID");
  }

  const restaurant = await restaurantModel.findByIdAndUpdate(restaurantId, {
    isSuspended: false,
    isOpen: true,
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Restuarant activated successfully"));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 5 } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 5;
  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Invalid Page number or Limit number");
  }
  const skip = (pageNumber - 1) * limitNumber;
  let filter = {};
  const validateStatus = [
    "PENDING",
    "ACCEPTED",
    "PREPARING",
    "READY",
    "DELIVERED",
    "CANCELLED",
  ];

  if (status && !validateStatus.includes(status)) {
    throw new ApiError(400, "Invalid status");
  } else if (status && validateStatus.includes(status)) {
    filter.orderStatus = status;
  }

  const [orders, totalOrders] = await Promise.all([
    orderModel
      .find(filter)
      .skip(skip)
      .limit(limitNumber)
      .populate({
        path: "user",
        select: "username",
      })
      .sort({ createdAt: -1 }),

    orderModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalOrders / limitNumber);

  return res.status(200).json(
    new ApiResponse(200, "Order details fetched successfully", {
      orders,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalOrders,
        totalPages,
      },
    }),
  );
});

const getOrderById = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid OrderID");
  }

  const order = await orderModel.findById(orderId).populate([
    {
      path: "user",
      select: "username",
    },
    {
      path: "items.menuItem",
      select: "name price image",
    },
  ]);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Order fetched successfully", { order }));
});

const configSettings = asyncHandler(async (req, res) => {
  let settings = await platformSettingsModel.findOne();
  if (!settings) {
    settings = await platformSettingsModel.create({});
  }

  return res
    .status(200)
    .json(new ApiResponse("Settings configured successfully", settings));
});

const editSettings = asyncHandler(async (req, res) => {
  const settings = await platformSettingsModel.findOne();
  if (!settings) {
    throw new ApiError(404, "Platform settings not found");
  }

  const updates = req.body;

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      settings[key] = value;
    }
  });

  if (settings.freeDeliveryAbove < settings.minimumOrderValue) {
    throw new ApiError(
      400,
      "Minimum order value cannot be above free delivery order value",
    );
  }

  settings.updatedBy = req.user.id;
  await settings.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Settings updated successfully", settings));
});

const getPlatformSettingsAdmin = asyncHandler(async (req, res) => {
  const platformSettings = await platformSettingsModel
    .findOne()
    .select("-updatedAt -createdAt -__v");
  if (!platformSettings) {
    throw new ApiError(404, "Platform settings not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Platform settings fetched successfully",
        platformSettings,
      ),
    );
});

const createCoupons = asyncHandler(async (req, res) => {
  let {
    code,
    discountType,
    discountValue,
    minimumOrderValue,
    maximumDiscount,
    expiryDate,
    usageLimit,
  } = req.body;

  const normalisedCode = code.trim().toUpperCase();
  const isExisting = await couponModel.findOne({ code: normalisedCode });
  if (isExisting) {
    throw new ApiError(409, "Coupon already exists");
  }

  const expiry = new Date(expiryDate);
  if (expiry <= new Date()) {
    throw new ApiError(400, "Coupon already expired");
  }

  if (discountType === "PERCENTAGE" && maximumDiscount <= 0) {
    throw new ApiError(
      400,
      "Maximum discount is required for percentage coupons",
    );
  }
  if (discountType === "PERCENTAGE") {
    if (discountValue > 100) {
      throw new ApiError(400, "Percentage cannot exceed 100%");
    }
  } else if (discountType === "FIXED") {
    maximumDiscount = 0;
  }

  const coupon = await couponModel.create({
    code: normalisedCode,
    discountType,
    discountValue,
    minimumOrderValue,
    maximumDiscount,
    expiryDate,
    usageLimit,
    createdBy: req.user.id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Coupon created successfully", coupon));
});

const getAllCoupons = asyncHandler(async (req, res) => {
  const { search, isActive, discountType, page = 1, limit = 5 } = req.query;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 5;
  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Page or limit number cannot be less than 1");
  }

  const skip = (pageNumber - 1) * limitNumber;
  let filter = {};
  if (search) {
    filter.code = {
      $regex: search,
      $options: "i",
    };
  }

  if (isActive === "true") {
    filter.isActive = true;
  } else if (isActive === "false") {
    filter.isActive = false;
  }

  const allowedTypes = ["PERCENTAGE", "FIXED"];

  if (discountType) {
    if (!discountType.includes(allowedTypes)) {
      throw new ApiError(400, "Invalid discount type");
    }
    filter.discountType = discountType;
  }

  const [coupons, totalCoupons] = await Promise.all([
    couponModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate({
        path: "createdBy",
        select: "username",
      }),

    couponModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCoupons / limitNumber);

  if (coupons.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, "No coupons to fetch", {
        coupons,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalCoupons,
          totalPages,
        },
      }),
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Coupons fetched successfully", {
      coupons,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalCoupons,
        totalPages,
      },
    }),
  );
});

const getCouponById = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new ApiError(400, "Invalid coupon ID");
  }

  const coupon = await couponModel.findById(couponId).populate({
    path: "createdBy",
    select: "username",
  });
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Coupon fetched successfully", coupon));
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new ApiError(400, "Invalid coupon ID`");
  }

  const coupon = await couponModel.findById(couponId);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  const updates = req.body;

  if (updates.code) {
    const normalisedCode = updates.code.trim().toUpperCase();
    const isExisting = await couponModel.findOne({
      code: normalisedCode,
      _id: { $ne: couponId },
    });

    if (isExisting) {
      throw new ApiError(409, "Coupon already exists");
    }
  }

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      coupon[key] = value;
    }
  });

  const expiry = new Date(coupon.expiryDate);
  if (expiry <= new Date()) {
    throw new ApiError(400, "Coupon already expired");
  }

  if (coupon.discountType === "PERCENTAGE") {
    if (coupon.discountValue > 100)
      throw new ApiError(400, "Discount value cannot be greater than 100");

    if (coupon.maximumDiscount < 1)
      throw new ApiError(
        400,
        "Maximum discount anount should be greater than 0",
      );
  } else if (coupon.discountType === "FIXED") {
    coupon.maximumDiscount = 0;
  }

  await coupon.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Coupon updated successfully", coupon));
});

const updateCouponStatus = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new ApiError(400, "Coupon ID is invalid");
  }
  const coupon = await couponModel.findById(couponId);
  if (!coupon) {
    throw new ApiError(404, "Coupon is not existing");
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  return res.status(200).json(
    new ApiResponse(200, "Coupon status updated successfully", {
      currentCouponState: coupon.isActive,
    }),
  );
});

const createAnnouncements = asyncHandler(async (req, res) => {
  const { title, description, priority, expiresAt } = req.body;

  const expiry = new Date(expiresAt);
  if (expiry <= new Date()) {
    throw new ApiError(400, "Expiry should be in the future");
  }
  if (priority < 1) {
    throw new ApiError(400, "Priority should be greater than or equal to 1");
  }

  const announcement = await announcementModel.create({
    title,
    description,
    priority,
    expiresAt,
    createdBy: req.user.id,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Announcement created succesfully", announcement),
    );
});

const getAnnouncements = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 5, isActive } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 5;
  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Page number or limit number is invalid");
  }
  const skip = (pageNumber - 1) * limitNumber;

  let filter = {};
  if (search) {
    filter.title = {
      $regex: search,
      $options: "i",
    };
  }

  if (isActive === "true") filter.isActive = true;
  else if (isActive === "false") filter.isActive = false;

  const [announcements, totalAnnouncements] = await Promise.all([
    announcementModel
      .find(filter)
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber)
      .populate({
        path: "createdBy",
        select: "username",
      }),

    announcementModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalAnnouncements / limitNumber);

  if (announcements.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, "No announcements fetched", {
        announcements,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalAnnouncements,
          totalPages,
        },
      }),
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Announcements fetched successfully", {
      announcements,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalAnnouncements,
        totalPages,
      },
    }),
  );
});

const getAnnouncementById = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(announcementId)) {
    throw new ApiError(400, "Announcement ID is invalid");
  }

  const announcement = await announcementModel
    .findById(announcementId)
    .populate({
      path: "createdBy",
      select: "username",
    });
  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Announcement fetched successfully", announcement),
    );
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(announcementId)) {
    throw new ApiError(400, "Invalid announcement ID");
  }

  const announcement = await announcementModel.findById(announcementId);
  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  const updates = req.body;
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) announcement[key] = value;
  });

  if (updates.expiresAt) {
    const expiry = new Date(updates.expiresAt);
    if (expiry <= new Date()) {
      throw new ApiError(400, "Expiry date must be in future");
    }
  }

  if (updates.priority !== undefined) {
    if (updates.priority < 1)
      throw new ApiError(400, "Priority cannot be less than 1");
  }

  await announcement.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Announcement updated successfully", announcement),
    );
});

const updateAnnouncementStatus = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(announcementId)) {
    throw new ApiError(400, "Invalid announcement ID");
  }

  const announcement = await announcementModel.findById(announcementId);
  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  announcement.isActive = !announcement.isActive;
  await announcement.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Announcement status updated successfully",
        announcement.isActive,
      ),
    );
});

const createBanner = asyncHandler(async (req, res) => {
  const { title, priority, redirectType, redirectedId } = req.body;

  if (redirectType !== "NONE" && !redirectedId) {
    throw new ApiError(400, "Redirect ID is required");
  }

  const imageLocalPath = req.file?.path;
  if (!imageLocalPath) {
    throw new ApiError(400, "Menu image is required");
  }

  const imageUrl = await uploadOnCloudinary(imageLocalPath);

  const banner = await bannerModel.create({
    title,
    priority,
    redirectType,
    redirectedId,
    image: imageUrl,
    createdBy: req.user.id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Banner created successfully", banner));
});

const getAllBanners = asyncHandler(async (req, res) => {
  const { search, isActive, page = 1, limit = 5 } = req.query;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 5;
  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Page or limit number cannot be less than 1");
  }

  const skip = (pageNumber - 1) * limitNumber;
  let filter = {};
  if (search) {
    filter.title = {
      $regex: search,
      $options: "i",
    };
  }

  if (isActive === "true") {
    filter.isActive = true;
  } else if (isActive === "false") {
    filter.isActive = false;
  }

  const [banners, totalBanners] = await Promise.all([
    bannerModel
      .find(filter)
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber)
      .populate({
        path: "createdBy",
        select: "username",
      }),

    bannerModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalBanners / limitNumber);
  if (banners.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, "No banners to show", {
        banners,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalBanners,
          totalPages,
        },
      }),
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Banners fetched successfully", {
      banners,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalBanners,
        totalPages,
      },
    }),
  );
});

const getBannerById = asyncHandler(async (req, res) => {
  const { bannerId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bannerId)) {
    throw new ApiError(400, "Banner ID is invalid");
  }

  const banner = await bannerModel.findById(bannerId).populate({
    path: "createdBy",
    select: "username",
  });
  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Banner fetched successfully", banner));
});

const updateBanner = asyncHandler(async (req, res) => {
  const { bannerId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bannerId)) {
    throw new ApiError(400, "Banner ID is invalid");
  }

  const banner = await bannerModel.findById(bannerId);
  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  const updates = req.body;
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      banner[key] = value;
    }
  });

  const imageLocalPath = req.file?.path;
  if (!imageLocalPath) {
    if (updates.redirectType !== "NONE" && !updates.redirectedId) {
      throw new ApiError(400, "Redirect ID is required");
    }
    await banner.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "Banner updated successfully", banner));
  }

  if (updates.redirectType !== "NONE" && !updates.redirectedId) {
    throw new ApiError(400, "Redirect ID is required");
  }

  const imageUrl = await uploadOnCloudinary(imageLocalPath);
  banner.image = imageUrl;
  await banner.save();
  return res
    .status(200)
    .json(new ApiResponse(200, "Banner updated successfully", banner));
});

const updateBannerStatus = asyncHandler(async (req, res) => {
  const { bannerId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bannerId)) {
    throw new ApiError(400, "Banner ID is invalid");
  }
  const banner = await bannerModel.findById(bannerId);
  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  banner.isActive = !banner.isActive;
  await banner.save();

  return res
    .status(200)
    .json(
      new ApiError(200, "Banner status updated successfully", banner.isActive),
    );
});

const topRestaurants = asyncHandler(async (req, res) => {
  const topRestaurants = await topRestaurantsPipeline();
  if (topRestaurants.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No restaurants found", topRestaurants));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Top restaurants fetched successfully",
        topRestaurants,
      ),
    );
});

const generateInvoice = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  const order = await orderModel.findById(orderId).populate([
    {
      path: "user",
      select: "username email",
    },
    {
      path: "restaurant",
      select: "restaurantName location phone",
    },
  ]);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const pdfBuffer = await generateInvoicePDF(order);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order.orderNumber}.pdf`,
  );
  res.send(pdfBuffer);
});

const abandonCart = asyncHandler(async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 5;
  const skip = (pageNumber - 1) * limitNumber;
  let filter = {};

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  filter.updatedAt = {
    $lte: yesterday,
  };

  filter.$expr = {
    $gt: [{ $size: "$items" }, 0],
  };

  const [carts, totalCarts] = await Promise.all([
    cartModel
      .find(filter)
      .populate({
        path: "user",
        select: "username email",
      })
      .sort({ updatedAt: 1 })
      .select("items totalAmount updatedAt")
      .skip(skip)
      .limit(limitNumber),

    cartModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCarts / limitNumber);

  if (carts.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, "No Abandoned carts to fetch", {
        carts,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalCarts,
          totalPages,
        },
      }),
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Abandoned carts fetched successfully", {
      carts,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalCarts,
        totalPages,
      },
    }),
  );
});

const sendReminder = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "User ID is invalid");
  }

  const user = await userModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User does not exists");
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const cart = await cartModel.findOne({
    user: userId,
    $expr: { $gt: [{ $size: "$items" }, 0] },
    updatedAt: { $lte: yesterday },
  });
  if (!cart) {
    throw new ApiError(404, "Cart does not exists");
  }

  if (!user.email) {
    throw new ApiError(400, "User does not have a valid email ID");
  }

  try {
    await sendEmail(
      user.email,
      "Hey Cutie you left something delicious behind!",
      `Hi Joel,

You left some delicious items in your CAMPUSIN cart.

Complete your order here:

${config.CLIENT_ID}/cart

Team CAMPUSIN`,
      reminderHTML(),
    );
  } catch (error) {
    throw new ApiError(400, "Error in sending email");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Email has been sent successfully"));
});

//MarketPlace admin controlls starts here

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, priority } = req.body;
  console.log(name);
  const imageLocalPath = req.file?.path;
  if (!imageLocalPath) {
    throw new ApiError(400, "Image file is not provided");
  }

  const normalisedName = name.trim().toUpperCase();
  const isExists = await marketPlaceCategoryModel.findOne({
    name: normalisedName,
  });

  if (isExists) {
    throw new ApiError(409, "Category already exists");
  }

  const imageUrl = await uploadOnCloudinary(imageLocalPath);

  const category = await marketPlaceCategoryModel.create({
    name: normalisedName,
    description,
    priority,
    image: imageUrl,
    createdBy: req.user.id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Category created successfully", category));
});

const getAllCategories = asyncHandler(async (req, res) => {
  const { search, isActive, page = 1, limit = 5 } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 5;
  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Page number or Limit number is not valid");
  }
  const skip = (pageNumber - 1) * limitNumber;
  let filter = {};
  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  if (isActive === "true") {
    filter.isActive = true;
  } else if (isActive === "false") {
    filter.isActive = false;
  }

  const [categories, totalCategories] = await Promise.all([
    marketPlaceCategoryModel
      .find(filter)
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .populate({
        path: "createdBy",
        select: "username",
      })
      .select("name description image priority isActive createdBy createdAt")
      .skip(skip)
      .limit(limitNumber),

    marketPlaceCategoryModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCategories / limitNumber);
  if (categories.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, "No categories found", {
        categories,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalCategories,
          totalPages,
        },
      }),
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Categories fetched successfully", {
      categories,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalCategories,
        totalPages,
      },
    }),
  );
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const category = await marketPlaceCategoryModel
    .findById(categoryId)
    .populate({
      path: "createdBy",
      select: "username",
    })
    .select(
      "name description image priority isActive createdBy createdAt updatedAt",
    );
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Category fetched successfully", category));
});

const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const category = await marketPlaceCategoryModel.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  const { name } = req.body;
  if (name) {
    const normalisedName = name.trim().toUpperCase();
    const isNameExists = await marketPlaceCategoryModel.findOne({
      name: normalisedName,
      _id: { $ne: category._id },
    });

    if (isNameExists) {
      throw new ApiError(409, " Category name already exists");
    }

    category.name = normalisedName;
  }

  const allowedUpdates = ["priority", "description"];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      category[field] = req.body[field];
    }
  });

  const imageLocalPath = req.file?.path;
  if (imageLocalPath) {
    const imageUrl = await uploadOnCloudinary(imageLocalPath);
    category.image = imageUrl;
  }

  await category.save();
  return res
    .status(200)
    .json(new ApiResponse(200, "Category updated successfully", category));
});

const updateCategoryStatus = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const category = await marketPlaceCategoryModel.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category does not exists");
  }

  category.isActive = !category.isActive;
  await category.save();

  return res.status(200).json(
    new ApiResponse(200, "Category status updates successfully", {
      status: category.isActive,
      categoryId: category._id,
    }),
  );
});

//Product related APIs of Marketplace

const createProducts = asyncHandler(async (req, res) => {
  const {
    category,
    name,
    description,
    price,
    stock,
    condition,
    sellerPhoneNumber,
  } = req.body;
  const imageLocalPath = req.files;
  if (!imageLocalPath || imageLocalPath.length === 0) {
    throw new ApiError(400, "Atlast one image is required");
  }

  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const IsCategoryExists = await marketPlaceCategoryModel.findById(category);
  if (!IsCategoryExists) {
    throw new ApiError(404, "Category does not exists");
  }

  if (!IsCategoryExists.isActive) {
    throw new ApiError(400, "Category is inactive");
  }

  const normalisedName = name.trim().toUpperCase();
  const isDuplicateProduct = await marketPlaceProductsModel.findOne({
    name: normalisedName,
    category,
  });

  if (isDuplicateProduct) {
    throw new ApiError(409, "Similar product exists");
  }

  let images = [];
  try {
    images = await Promise.all(
      imageLocalPath.map((file) => uploadOnCloudinary(file.path)),
    );
  } catch (error) {
    throw new ApiError(500, "Failed to upload images");
  }

  const product = await marketPlaceProductsModel.create({
    name: normalisedName,
    category,
    description,
    price,
    stock,
    condition,
    images,
    createdBy: req.user.id,
    sellerPhoneNumber,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Product created successfully", product));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const {
    search,
    isActive,
    category,
    condition,
    page = 1,
    limit = 5,
  } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 5;
  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Page number or Limit number is invalid");
  }

  const skip = (pageNumber - 1) * limitNumber;
  let filter = {};
  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }
  if (isActive === "true") {
    filter.isActive = true;
  } else if (isActive === "false") {
    filter.isActive = false;
  }

  const allowedTypes = ["NEW", "LIKE_NEW", "GOOD", "FAIR"];
  if (allowedTypes.includes(condition)) {
    filter.condition = condition;
  }

  if (category) {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      throw new ApiError(400, "Category ID is not valid");
    }
    filter.category = category;
  }

  const [products, totalProducts] = await Promise.all([
    marketPlaceProductsModel
      .find(filter)
      .populate([
        {
          path: "category",
          select: "name",
        },
        {
          path: "createdBy",
          select: "username",
        },
      ])
      .select(
        "_id name price stock condition isActive category createdBy createdAt images",
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber),

    marketPlaceProductsModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalProducts / limitNumber);
  if (products.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, "No products to fetch", {
        products,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalProducts,
          totalPages,
        },
      }),
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Products fetched successfully", {
      products,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalProducts,
        totalPages,
      },
    }),
  );
});

const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Product ID is invalid");
  }

  const product = await marketPlaceProductsModel
    .findById(productId)
    .populate([
      {
        path: "category",
        select: "name",
      },
      {
        path: "createdBy",
        select: "username",
      },
    ])
    .select(
      "name price stock condition isActive category createdBy description images sellerPhoneNumber createdAt updatedAt",
    );
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Product fetchd successfully", product));
});

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
  updateCouponStatus,
  createAnnouncements,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  updateAnnouncementStatus,
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  updateBannerStatus,
  topRestaurants,
  getPlatformSettingsAdmin,
  generateInvoice,
  abandonCart,
  sendReminder,
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  createProducts,
  getProductById,
  getAllProducts,
};
