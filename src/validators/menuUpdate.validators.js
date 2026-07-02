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

const allowedFoodTypes = ["veg", "non-veg"];
const menuUpdateValidationRules = [
  body("name").optional().trim().notEmpty().withMessage("Cannot be empty"),
  body("price").optional().isFloat({ min: 0 }),
  body("description").optional().trim(),
  body("category").optional().trim(),
  body("image").optional(),
  body("foodType").optional()
    .trim()
    .isIn(allowedFoodTypes)
    .withMessage("Invalid food type"),
  validateResult,
];

export { menuUpdateValidationRules };
