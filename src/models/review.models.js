import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant ID is required"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be atleast 1 star"],
      max: [5, "Rating cannot exceed 5"],
      required: [true, "Rating is required"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index(
  {
    user: 1,
    restaurant: 1,
  },
  {
    unique: true,
  },
);
const reviewModel = mongoose.model("Review", reviewSchema);

export default reviewModel;
