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
const menuUpdateValidationRules = [
    body('name')
        .optional()
        .trim()
        .notEmpty().
        withMessage("Cannot be empty"),
    body('price')
        .optional()
        .isFloat({min:0}),
    body('description')
        .optional()
        .trim(),
    body('category')
    .optional()
     .trim(),
     body('image')
        .optional(),
    validateResult
]

export {menuUpdateValidationRules}