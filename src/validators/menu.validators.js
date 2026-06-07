import { body, validationResult } from "express-validator";
import ApiError from "../utils/apiErrors.js";

const validateResult = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = errors.array().map((err) => ({
        field: err.path,
        message: err.msg
    }))
    throw new ApiError(400, "Validation failed", extractedErrors)
}
const menuValidationRules = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty"),
    body('price')
        .notEmpty()
        .withMessage("Price cannot be empty")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    body('category')
        .trim()
        .notEmpty()
        .withMessage("Category cannot be empty"),
    validateResult
]

export { menuValidationRules }