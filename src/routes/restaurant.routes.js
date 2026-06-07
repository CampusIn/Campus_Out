import {Router} from 'express';
import restaurantController from '../controllers/restaurant.controller.js';
import {restaurantValidationRules} from '../validators/restaurant.validators.js';
import {authMiddleware} from '../middlewares/auth.middlewares.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const restaurantRoute = Router();

restaurantRoute.post('/restaurants',authMiddleware,roleMiddleware('vendor'),restaurantValidationRules,restaurantController.createRestaurant);
restaurantRoute.patch('/restaurants/:id',authMiddleware,roleMiddleware('vendor'),restaurantController.updateRestaurant);
restaurantRoute.get('/restaurants/my',authMiddleware,roleMiddleware('vendor'),restaurantController.getMyRestaurants);
restaurantRoute.get('/restaurants/:id',authMiddleware,restaurantController.getRestaurantById);
restaurantRoute.delete('/restaurants/:id',authMiddleware,roleMiddleware('vendor'),restaurantValidationRules,restaurantController.dltRestaurantById);
restaurantRoute.patch('/restaurants/:id/status',authMiddleware,roleMiddleware('vendor'),restaurantValidationRules,restaurantController.updateRestaurantStatus)

export default restaurantRoute;