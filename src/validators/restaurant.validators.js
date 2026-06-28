import { body, validationResult } from "express-validator";
import ApiError from "../utils/apiErrors.js";

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  throw new ApiError(400, "Validation failed", extractedErrors);
};

const restaurantValidationRules = [
  body("restaurantName").notEmpty().withMessage("Restaurant name is required"),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone()
    .withMessage("Invalid phone number format"),

  body("location").notEmpty().withMessage("Location is required"),
  validateResult,
];
const restaurantStatusValidationRule = [
  body("isOpen").isBoolean().withMessage("Input must be a boolean"),
  validateResult,
];

export { restaurantValidationRules, restaurantStatusValidationRule };
