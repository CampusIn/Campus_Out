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
const updateRepairPartnerRules = [
    body("name")
        .optional()
        .trim(),
    
    body("phoneNumber")
        .optional()
        .trim()
        .isMobilePhone("en-IN")
        .withMessage("Phone number should be a valid Indian number"),

    body("specialisations")
        .optional()
        .isIn(allowedTypes)
        .withMessage("Specialisation should be in the allowed types"),

    validateResult

]

export default updateRepairPartnerRules