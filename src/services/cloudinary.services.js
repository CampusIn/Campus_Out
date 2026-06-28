import { v2 as cloudinary } from "cloudinary";
import config from "../config/config.js";
import fs from "fs";

cloudinary.config({
  cloud_name: config.CLOUDINARY_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return "Local file path not detected";
    //File upload in cloundinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });
    fs.unlinkSync(localFilePath);
    return response.url;
  } catch (error) {
    fs.unlinkSync(localFilePath); //removes the loacally saved file in the server if file upload to cloudinary fails
    throw new Error("Cloudinary upload failed");
  }
};

export { uploadOnCloudinary };
