import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import orderController from "../controllers/order.controllers.js";
import { blockMiddleware } from "../middlewares/block.middlewares.js";

const orderRouter = Router();

orderRouter.post(
  "/order",
  authMiddleware,
  roleMiddleware("user"),
  blockMiddleware,
  orderController.createOrder,
);
orderRouter.get(
  "/orders/my",
  authMiddleware,
  roleMiddleware("user"),
  orderController.getAllOrders,
);
orderRouter.get(
  "/orders/:orderId",
  authMiddleware,
  roleMiddleware("user"),
  orderController.getSingleOrder,
);
orderRouter.patch(
  "/orders/:orderId/cancel",
  authMiddleware,
  roleMiddleware("user"),
  orderController.cancelOrder,
);
orderRouter.get(
  "/order/restaurant",
  authMiddleware,
  roleMiddleware("vendor"),
  orderController.getVendorOrder,
);
orderRouter.get(
  "/order/restaurant/:orderId",
  authMiddleware,
  roleMiddleware("vendor"),
  orderController.getSingleVendorOrder,
);
orderRouter.patch(
  "/order/:orderId/status",
  authMiddleware,
  roleMiddleware("vendor"),
  orderController.changeOrderStatus,
);

orderRouter.get(
  '/settings',
  authMiddleware,
  roleMiddleware('user'),
  orderController.getPlatformSettingsUser
)

orderRouter.get(
    "/coupons/view",
    authMiddleware,
    roleMiddleware("user"),
    orderController.getAllCoupons
);

orderRouter.post(
    "/coupons/apply",
    authMiddleware,
    roleMiddleware("user"),
    orderController.applyCoupon
)

export default orderRouter;
