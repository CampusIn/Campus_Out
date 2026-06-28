import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema({
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  usedAt: {
    type: Date,
    default: Date.now,
  },
});

couponUsageSchema.index(
  {
    coupon: 1,
    user: 1,
  },
  {
    unique: true,
  },
);
const couponUsageModel = mongoose.model("CouponUsage", couponUsageSchema);

export default couponUsageModel;
