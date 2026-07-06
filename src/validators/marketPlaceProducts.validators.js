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

const allowedConditions = ["NEW", "LIKE_NEW", "GOOD", "FAIR"];


const marketPlaceProductsValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 3, max: 40 })
    .withMessage("Length of the name should be between 3 and 40 characters"),

  body("category")
    .isMongoId()
    .withMessage('The category ID is not valid'),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 10, max: 250 })
    .withMessage("Length of the description between 10 and 250 charaters"),

  body("price")
    .isInt({ min: 0 })
    .withMessage("Price cannot be a negative number"),

  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock cannot be a negative number"),

  body("condition")
    .optional()
    .isIn(allowedConditions)
    .withMessage("Condition should be in the allowed types"),

  body("sellerPhoneNumber")
    .optional()
    .isMobilePhone("en-IN")
    .withMessage("Enter a valid phone number"),

  validateResult,
];

export default marketPlaceProductsValidationRules;
