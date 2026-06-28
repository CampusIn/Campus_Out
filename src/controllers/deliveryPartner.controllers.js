import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import deliveryPartnerModel from "../models/deliveryPartner.models.js";
import orderModel from "../models/order.models.js";
import mongoose from "mongoose";

const createProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const isExisting = await deliveryPartnerModel.findOne({
    user: userId,
  });

  if (isExisting) {
    throw new ApiError(409, "Delivery partner profile already exists");
  }
  const { phoneNumber, vehicleNumber } = req.body;
  const deliveryPartner = await deliveryPartnerModel.create({
    user: userId,
    phoneNumber,
    vehicleNumber,
  });

  if (!deliveryPartner) {
    throw new ApiError(500, "Failed to create a new delivery partner");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Delivery partner created successfully",
        deliveryPartner,
      ),
    );
});

const assignPartner = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { deliveryPartnerId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid Order Id");
  }

  if (!mongoose.Types.ObjectId.isValid(deliveryPartnerId)) {
    throw new ApiError(400, "Invalid Delivery Partner Id");
  }

  const order = await orderModel.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order does not exists");
  }
  if (order.orderStatus !== "READY") {
    throw new ApiError(400, "Order is not ready for delivery");
  }
  if (order.deliveryPartner) {
    throw new ApiError(400, "Delivery partner already assigned");
  }

  const deliveryPartner =
    await deliveryPartnerModel.findById(deliveryPartnerId);
  if (!deliveryPartner) {
    throw new ApiError(404, "Delivery partner does not exists");
  }

  if (!deliveryPartner.isAvailable) {
    throw new ApiError(400, "Partner unavailable");
  }

  order.deliveryPartner = deliveryPartner._id;
  await order.save();

  deliveryPartner.isAvailable = false;
  await deliveryPartner.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Delivery partner assigned successfully", order),
    );
});

const viewAllOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const deliveryPartner = await deliveryPartnerModel.findOne({
    user: userId,
  });

  if (!deliveryPartner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  const orders = await orderModel
    .find({
      deliveryPartner: deliveryPartner._id,
    })
    .populate({
      path: "user",
      select: "username",
    })
    .sort({ createdAt: -1 });

  if (orders.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No orders to show", orders));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Orders fetched successfully", orders));
});

const viewOneOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const deliveryPartner = await deliveryPartnerModel.findOne({
    user: req.user.id,
  });

  if (!deliveryPartner) {
    throw new ApiError(404, "Delivery partner not found");
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

  if (order.deliveryPartner.toString() !== deliveryPartner._id.toString()) {
    throw new ApiError(403, "No access to this order");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Order fetched successfully", order));
});

const pickUpOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  const deliveryPartner = await deliveryPartnerModel.findOne({
    user: req.user.id,
  });

  if (!deliveryPartner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  const order = await orderModel.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order does not exists");
  }

  if (order.deliveryPartner.toString() !== deliveryPartner._id.toString()) {
    throw new ApiError(403, "Forbidden");
  }

  if (order.orderStatus !== "READY") {
    throw new ApiError(400, "Order must be READY before pickup");
  }

  order.orderStatus = "OUT_FOR_DELIVERY";
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Order Picked up successfully", order));
});

const deliverOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  const deliveryPartner = await deliveryPartnerModel.findOne({
    user: req.user.id,
  });

  if (!deliveryPartner) {
    throw new ApiError(404, "Delivery partner not found");
  }

  const order = await orderModel.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order does not exists");
  }

  if (order.deliveryPartner.toString() !== deliveryPartner._id.toString()) {
    throw new ApiError(403, "Forbidden");
  }

  if (order.orderStatus !== "OUT_FOR_DELIVERY") {
    throw new ApiError(400, "Order must be OUT_FOR_DELIVERY before delivery");
  }
  order.orderStatus = "DELIVERED";
  deliveryPartner.isAvailable = true;

  await Promise.all([order.save(), deliveryPartner.save()]);

  return res
    .status(200)
    .json(new ApiResponse(200, "delivered successfully", order));
});

export default {
  createProfile,
  assignPartner,
  viewAllOrders,
  viewOneOrder,
  pickUpOrder,
  deliverOrder,
};
