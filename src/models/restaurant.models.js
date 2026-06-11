import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique:true
        },

        restaurantName: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        category: {
            type: String,
            enum: [
                "Fast Food",
                "Cafe",
                "Bakery",
                "South Indian",
                "North Indian",
                "Chinese",
                "Other"
            ]
        },

        phone: {
            type: String,
            required: true
        },

        email: {
            type: String,
            lowercase: true
        },

        logo: {
            type: String
        },

        banner: {
            type: String
        },

        location: {
            type: String,
            required: true
        },

        deliveryTime: {
            type: Number,
            default: 30
        },

        minimumOrder: {
            type: Number,
            default: 0
        },

        isOpen: {
            type: Boolean,
            default: true
        },

        rating: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const restaurantModel = mongoose.model(
    "Restaurant",
    restaurantSchema
);

export default restaurantModel;