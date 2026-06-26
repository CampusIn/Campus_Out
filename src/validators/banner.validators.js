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

const allowedTypes = ["NONE","RESTAURANT","COUPON","MARKETPLACE"]

const bannerValidationRules = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title cannot be empty')
        .isLength({ min: 6 })
        .withMessage('Title must be atleast 6 characters long'),
    
    body('redirectType')
        .isIn(allowedTypes)
        .withMessage('Redirect type should be in the allowed types'),

    body('priority')
        .isInt({min:1})
        .withMessage('Priority cannot be less than 1'),

    validateResult


]

export default bannerValidationRules