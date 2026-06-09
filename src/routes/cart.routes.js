import { Router } from "express";
import cartControllers from "../controllers/cart.controllers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";
const cartRouter = Router();

cartRouter.post('/cart/items',authMiddleware,roleMiddleware('user'),cartControllers.addToCart)
cartRouter.get('/cart',authMiddleware,roleMiddleware('user'),cartControllers.getItemsFromCart)
export default cartRouter