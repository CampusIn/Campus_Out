import {body,validationResult} from 'express-validator';
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

const menuStatusValidationRule = [
    body('isAvailable')
        .isBoolean()
        .withMessage('Input must be a boolean'),
    validateResult
]

export {menuStatusValidationRule}