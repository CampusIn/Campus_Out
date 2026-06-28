import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  vehicleNumber: {
    type: String,
    required: [true, "Vehicle number is required"],
    trim: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

const deliveryPartnerModel = mongoose.model(
  "DeliveryPartner",
  deliveryPartnerSchema,
);

export default deliveryPartnerModel;
