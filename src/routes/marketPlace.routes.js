import { Router } from "express";
import marketPlaceController from "../controllers/marketPlace.contollers.js";
import marketCartController from "../controllers/marketCart.controllers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { blockMiddleware } from "../middlewares/block.middlewares.js";
import marketCartValidationRules from "../validators/marketCart.validators.js";

const marketRouter = Router();

marketRouter.get(
  "/categories",
  authMiddleware,
  roleMiddleware("user"),
  marketPlaceController.getAllCategoriesByUser,
);

marketRouter.get(
  "/products",
  authMiddleware,
  roleMiddleware("user"),
  marketPlaceController.getAllProductsByUser,
);

marketRouter.get(
  "/products/:productId",
  authMiddleware,
  roleMiddleware("user"),
  marketPlaceController.getProductsByIdUser,
);

marketRouter.post(
  "/cart",
  authMiddleware,
  roleMiddleware("user"),
  blockMiddleware,
  marketCartValidationRules,
  marketCartController.addToMarketCart,
);

marketRouter.get(
  "/cart",
  authMiddleware,
  roleMiddleware("user"),
  marketCartController.getItemsFromMarketCart,
);

marketRouter.patch(
  "/cart/items/:productId",
  authMiddleware,
  roleMiddleware("user"),
  blockMiddleware,
  marketCartController.updateMarketCartItemQuantity,
);

marketRouter.delete(
  "/cart/items/:productId",
  authMiddleware,
  roleMiddleware("user"),
  blockMiddleware,
  marketCartController.deleteMarketCartItem,
);

marketRouter.delete(
  "/cart",
  authMiddleware,
  roleMiddleware("user"),
  blockMiddleware,
  marketCartController.deleteMarketCart,
);
export default marketRouter;
