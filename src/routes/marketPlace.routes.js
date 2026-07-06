import { Router } from "express";
import marketPlaceController from "../controllers/marketPlace.contollers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const marketRouter = Router();

marketRouter.get(
    "/categories",
    authMiddleware,
    roleMiddleware('user'),
    marketPlaceController.getAllCategoriesByUser
)

export default marketRouter