import { Router } from "express";
import cartControllers from "../controllers/cart.controllers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import authControllers from "../controllers/auth.controllers.js";
const cartRouter = Router();

cartRouter.post('/cart/items',authMiddleware,roleMiddleware('user'),cartControllers.addToCart)
cartRouter.get('/cart',authMiddleware,roleMiddleware('user'),cartControllers.getItemsFromCart)
cartRouter.patch('/cart/items/:menuItemId',authMiddleware,roleMiddleware('user'),cartControllers.updateCartItemQuantity)
export default cartRouter