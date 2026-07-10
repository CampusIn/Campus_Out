import { Router } from "express";
import validators from "../validators/deliveryPartner.validators.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import deliveryControllers from "../controllers/deliveryPartner.controllers.js";

const deliveryRouter = Router();

deliveryRouter.post(
  "/profile",
  authMiddleware,
  roleMiddleware("delivery_partner"),
  validators.deliveryPartnerValidationRules,
  deliveryControllers.createProfile,
);

deliveryRouter.patch(
  "/orders/:orderId/assign-delivery",
  authMiddleware,
  roleMiddleware("vendor"),
  deliveryControllers.assignPartner,
);

deliveryRouter.get(
  "/orders",
  authMiddleware,
  roleMiddleware("delivery_partner"),
  deliveryControllers.viewAllOrders,
);

deliveryRouter.get(
  "/orders/:orderId",
  authMiddleware,
  roleMiddleware("delivery_partner"),
  deliveryControllers.viewOneOrder,
);

deliveryRouter.patch(
  "/orders/:orderId/pick-up",
  authMiddleware,
  roleMiddleware("delivery_partner"),
  deliveryControllers.pickUpOrder,
);

deliveryRouter.patch(
  "/orders/:orderId/deliver",
  authMiddleware,
  roleMiddleware("delivery_partner"),
  deliveryControllers.deliverOrder,
);

deliveryRouter.get(
  "/marketplace/orders",
  authMiddleware,
  roleMiddleware("delivery_partner"),
  deliveryControllers.viewAllMarketPlaceOrders
);

deliveryRouter.get(
  "/marketplace/orders/:orderId",
  authMiddleware,
  roleMiddleware("delivery_partner"),
  deliveryControllers.viewOrderById
);

deliveryRouter.patch(
  "/marketplace/orders/:orderId/status",
  authMiddleware,
  roleMiddleware("delivery_partner"),
  deliveryControllers.updateOrderStatus
)

export default deliveryRouter;
