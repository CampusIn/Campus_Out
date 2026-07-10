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

const marketCartValidationRules = [
  body("productId").isMongoId().withMessage("Invalid product ID"),

  body("quantity").isInt({ min: 1 }).withMessage("Enter a valid quantity"),

  validateResult,
];

export default marketCartValidationRules;
