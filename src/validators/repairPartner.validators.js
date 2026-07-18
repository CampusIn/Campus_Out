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

const allowedTypes = ["MOBILE", "LAPTOP", "COOLERS", "OTHERS"];
const repairPartnerValidationRules = [
  body("name").trim().notEmpty().withMessage("Name cannot be empty"),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number cannot be empty")
    .isMobilePhone("en-IN")
    .withMessage("Please provide a valid Indian mobile number"),

  body("specialisations")
    .notEmpty()
    .withMessage("Specialisations are required")
    .isIn(allowedTypes)
    .withMessage("Specialisations should be in the allowed types"),
  validateResult,
];

export default repairPartnerValidationRules;
