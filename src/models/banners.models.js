import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    redirectType: {
      type: String,
      enum: ["NONE", "RESTAURANT", "COUPON", "MARKETPLACE"],
      default: "NONE",
    },
    redirectedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    priority: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const bannerModel = mongoose.model("Banner", bannerSchema);

export default bannerModel;
