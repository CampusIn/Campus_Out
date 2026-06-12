import { Router } from "express";
import reviewsController from "../controllers/reviews.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from '../middlewares/role.middleware.js';
import reviewValidationRules from "../validators/review.validators.js";

const reviewRoute = Router();

reviewRoute.post('/reviews/:restaurantId',authMiddleware,roleMiddleware('user'),reviewValidationRules,reviewsController.createReview)

reviewRoute.get('/restaurants/:restaurantId/reviews',reviewsController.getAllReview)

export default reviewRoute