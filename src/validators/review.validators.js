import { body, validationResult } from 'express-validator';
import ApiError from '../utils/apiErrors.js';

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

const reviewValidationRules = [
    body('rating')
        .notEmpty()
        .withMessage("Rating cannot be empty")
        .isInt({min:1, max:5})
        .withMessage("Rating should be an integer and it should be between 1 and 5"),

    body('comment')
        .isLength({max:120})
        .trim()
        .withMessage("Maximum 120 words can only be types"),
    validateResult
    
]

export default reviewValidationRules