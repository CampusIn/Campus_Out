import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: [true, "Item is required"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Atleast 1 item should be added"],
    },
  },
  {
    _id: false,
  },
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id is required"],
      unique: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

cartSchema.index({items:1})

const cartModel = mongoose.model("Cart", cartSchema);

export default cartModel;
