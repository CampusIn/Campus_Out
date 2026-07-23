import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import userModel from "../models/user.models.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization?.split(" ")[1];
  if (!authHeader) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    const decoded = jwt.verify(authHeader, config.JWT_SECRET);
  if (!decoded) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await userModel.findById(decoded.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  req.user = {
    id: decoded.id,
    role: decoded.role,
    isBlocked: user.isBlocked,
  };

  next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired");
    }
    throw new ApiError(401, "Invalid token");
  }
});

const setAuthRole = (role) => (req, res, next) => {
  req.authRole = role;
  next();
};

export { authMiddleware, setAuthRole };
