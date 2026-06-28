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

const deliveryPartnerValidationRules = [
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("en-IN")
    .withMessage("Enter a valid mobile number"),

  body("vehicleNumber")
    .trim()
    .toUpperCase()
    .notEmpty()
    .withMessage("Vehicle number is required")
    .isLength({ min: 6 })
    .withMessage("Vehicle number should be atleast 6 characters"),
  validateResult,
];

export default {
  deliveryPartnerValidationRules,
};
