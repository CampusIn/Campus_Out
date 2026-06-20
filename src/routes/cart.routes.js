import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import cartControllers from "../controllers/cart.controllers.js";
import authControllers from "../controllers/auth.controllers.js";
import { blockMiddleware } from "../middlewares/block.middlewares.js";
const cartRouter = Router();

cartRouter.post('/cart/items',authMiddleware,roleMiddleware('user'),blockMiddleware,cartControllers.addToCart)
cartRouter.get('/cart',authMiddleware,roleMiddleware('user'),cartControllers.getItemsFromCart)
cartRouter.patch('/cart/items/:menuItemId',authMiddleware,roleMiddleware('user'),blockMiddleware,cartControllers.updateCartItemQuantity)
cartRouter.delete('/cart/items/:menuItemId',authMiddleware,roleMiddleware('user'),blockMiddleware,cartControllers.deleteCartItem)
cartRouter.delete('/cart',authMiddleware,roleMiddleware('user'),blockMiddleware,cartControllers.deleteCart)
export default cartRouter