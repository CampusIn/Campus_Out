import { Router } from "express";
import adminController from "../controllers/admin.controllers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const adminRouter = Router();

adminRouter.get('/dashboard',authMiddleware,roleMiddleware('admin'),adminController.viewAdminDashboard);

adminRouter.get('/dashboard/users',authMiddleware,roleMiddleware('admin'),adminController.viewUsers);

adminRouter.get('/dashboard/vendors',authMiddleware,roleMiddleware('admin'),adminController.viewVendors);

adminRouter.get('/dashboard/restaurants',authMiddleware,roleMiddleware('admin'),adminController.viewRestaurants);

adminRouter.patch('/users/:id/block',authMiddleware,roleMiddleware('admin'),adminController.blockUser);

adminRouter.patch('/users/:id/unblock',authMiddleware,roleMiddleware('admin'),adminController.unBlockUser);

adminRouter.patch('/restaurants/:id/suspend',authMiddleware,roleMiddleware('admin'),adminController.suspendRestaurant);

adminRouter.patch('/restaurants/:id/activate',authMiddleware,roleMiddleware('admin'),adminController.activateRestaurant);

adminRouter.get('/orders',authMiddleware,roleMiddleware('admin'),adminController.getAllOrders);

adminRouter.get('/orders/:id',authMiddleware,roleMiddleware('admin'),adminController.getOrderById);

export default adminRouter