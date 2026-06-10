import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import orderController from "../controllers/order.controllers.js";

const orderRouter = Router();

orderRouter.post('/order',authMiddleware, roleMiddleware("user"), orderController.createOrder)
orderRouter.get('/orders/my',authMiddleware,roleMiddleware('user'),orderController.getAllOrders)

export default orderRouter;