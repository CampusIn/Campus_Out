import {body, validationResult} from 'express-validator';
import ApiError from '../utils/apiErrors.js';

const validateResult = (req,res,next) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        return next();
    }
    const extractedErrors = errors.array().map((err)=>({
        field:err.path,
        message:err.msg
    }))

    throw new ApiError(400, "Validation failed", extractedErrors)
}

const announcementValidationRules = [
    body('title')
        .notEmpty()
        .withMessage('Title cannot be empty')
        .isLength({min:6})
        .withMessage('Title cannot be less than 6 characters'),
    
    body('description')
        .notEmpty()
        .withMessage('Description cannot be empty')
        .isLength({min:10})
        .withMessage('Description cannot be less than 10 characters'),

    body('priority')
        .isInt({min:1})
        .withMessage('Priority should be greater than 0'),

    body('expiresAt')
        .isISO8601()
        .withMessage('Date format is invalid'),

    validateResult
]

export default announcementValidationRules