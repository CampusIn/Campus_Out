import { Router } from "express";
import { menuValidationRules } from "../validators/menu.validators.js";
import{authMiddleware} from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import menuController from "../controllers/menu.controllers.js";
const menuRouter = Router();

menuRouter.post('/:restaurantId/menu',authMiddleware,roleMiddleware("vendor"),menuValidationRules,menuController.createMenuItem)
menuRouter.get('/:restaurantId/menu',menuController.getRestaurantMenu)
menuRouter.get('/menu/:id',menuController.getMenuItemById)
export default menuRouter;