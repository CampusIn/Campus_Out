import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant Id is required"],
    },
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
      min: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
      foodType:{
        type:String,
        enum:["veg","non-veg"],
        required:[true,"Food type is required"]
      }
    ,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "",
    },
    stockQty: {
      type: Number,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  },
);

const menuModel = mongoose.model("Menu", menuItemSchema);

export default menuModel;
