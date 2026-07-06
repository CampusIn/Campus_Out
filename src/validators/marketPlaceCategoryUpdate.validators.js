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

const marketPlaceCategoryUpdateValidationRules = [
    body("name")
        .optional()
        .trim()
        .isLength({min:3, max:40})
        .withMessage('Name should be between 3 and 40 characters'),
    
    body("description")
        .optional()
        .trim()
        .isLength({min:6, max:250})
        .withMessage('Description should be between 6 and 250 characters'),
    
    body("priority")
            .optional()
            .isInt({min:1})
            .withMessage('Minimum priority should be 1'),
    
        validateResult
]


export default marketPlaceCategoryUpdateValidationRules