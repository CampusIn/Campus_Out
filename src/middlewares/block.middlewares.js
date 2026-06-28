import ApiError from "../utils/apiErrors.js";
import asyncHandler from "../utils/asyncHandler.js";

const blockMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked");
  }

  next();
});

export { blockMiddleware };
