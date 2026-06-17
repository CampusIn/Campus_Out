import { Router } from "express";
import { menuValidationRules } from "../validators/menu.validators.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import menuController from "../controllers/menu.controllers.js";
import { menuUpdateValidationRules } from "../validators/menuUpdate.validators.js";
import { menuStatusValidationRule } from "../validators/menuStatus.validators.js";
import upload from "../middlewares/multer.middlewares.js"
const menuRouter = Router();

menuRouter.post('/:restaurantId/menu', authMiddleware, roleMiddleware("vendor"), upload.single('image'), menuValidationRules, menuController.createMenuItem)
menuRouter.get('/:restaurantId/menu', menuController.getRestaurantMenu)
menuRouter.get('/menu/:id', menuController.getMenuItemById)
menuRouter.patch('/menu/:id', authMiddleware, roleMiddleware('vendor'), menuUpdateValidationRules, menuController.updateMenuItem)
menuRouter.patch('/menu/:id/status', authMiddleware, roleMiddleware('vendor'), menuStatusValidationRule, menuController.updateMenuStatus)
menuRouter.delete('/menu/:id', authMiddleware, roleMiddleware('vendor'), menuController.deleteMenuItem)
export default menuRouter;