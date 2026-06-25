import { Router } from "express";
import adminController from "../controllers/admin.controllers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import settingsValidatorsRules from "../validators/settings.validators.js";
import couponValidationRules from "../validators/coupon.validators.js";
import couponUpdateValidationRules from "../validators/couponUpdate.validators.js";

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

adminRouter.get('/settings',authMiddleware,roleMiddleware('admin'),adminController.configSettings);

adminRouter.patch('/settings',authMiddleware,roleMiddleware('admin'),settingsValidatorsRules,adminController.editSettings);

adminRouter.post('/coupons',authMiddleware,roleMiddleware('admin'),couponValidationRules,adminController.createCoupons);

adminRouter.get('/coupons',authMiddleware,roleMiddleware('admin'),adminController.getAllCoupons);

adminRouter.get('/coupons/:couponId',authMiddleware,roleMiddleware('admin'),adminController.getCouponById);

adminRouter.patch('/coupons/:couponId',authMiddleware,roleMiddleware('admin'),couponUpdateValidationRules,adminController.updateCoupon);

adminRouter.patch('/coupons/:couponId/status',authMiddleware,roleMiddleware('admin'),adminController.updateCouponStatus)


export default adminRouter