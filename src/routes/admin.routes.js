import { Router } from "express";
import adminController from "../controllers/admin.controllers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const adminRouter = Router();

adminRouter.get('/dashboard',authMiddleware,roleMiddleware('admin'),adminController.viewAdminDashboard)
adminRouter.get('/dashboard/users',authMiddleware,roleMiddleware('admin'),adminController.viewUsers)
adminRouter.get('/dashboard/vendors',authMiddleware,roleMiddleware('admin'),adminController.viewVendors)
adminRouter.get('/dashboard/restaurants',authMiddleware,roleMiddleware('admin'),adminController.viewRestaurants)

export default adminRouter