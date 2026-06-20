import { Router } from 'express';
import restaurantController from '../controllers/restaurant.controller.js';
import { restaurantValidationRules } from '../validators/restaurant.validators.js';
import { authMiddleware } from '../middlewares/auth.middlewares.js';
import { blockMiddleware } from '../middlewares/block.middlewares.js'
import roleMiddleware from '../middlewares/role.middleware.js';
import { restaurantSuspensionMiddleware } from '../middlewares/restaurantSuspension.middlewares.js';

const restaurantRoute = Router();

restaurantRoute.post('/restaurants', authMiddleware, roleMiddleware('vendor'), blockMiddleware, restaurantValidationRules, restaurantController.createRestaurant);

restaurantRoute.patch('/restaurants/:id', authMiddleware, roleMiddleware('vendor'), blockMiddleware, restaurantSuspensionMiddleware, restaurantController.updateRestaurant);

restaurantRoute.get('/restaurants/my', authMiddleware, roleMiddleware('vendor'), restaurantController.getMyRestaurants);
restaurantRoute.get('/restaurants/:id', authMiddleware, restaurantController.getRestaurantById);

restaurantRoute.delete('/restaurants/:id', authMiddleware, roleMiddleware('vendor'), blockMiddleware, restaurantController.dltRestaurantById);

restaurantRoute.patch('/restaurants/:id/status', authMiddleware, roleMiddleware('vendor'), blockMiddleware, restaurantSuspensionMiddleware, restaurantValidationRules, restaurantController.updateRestaurantStatus);

restaurantRoute.get('/restaurants', restaurantController.getAllRestaurantsByUser);

restaurantRoute.get('/restaurant/:id', restaurantController.getRestaurantByUser);

export default restaurantRoute;