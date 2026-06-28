import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import vendorControllers from "../controllers/vendor.controllers.js";
import { blockMiddleware } from "../middlewares/block.middlewares.js";
import upload from "../middlewares/multer.middlewares.js";

const vendorRoute = Router();

vendorRoute.get(
  "/dashboard/overview",
  authMiddleware,
  roleMiddleware("vendor"),
  vendorControllers.getVendorOverview,
);

vendorRoute.get(
  "/dashboard/top-items",
  authMiddleware,
  roleMiddleware("vendor"),
  vendorControllers.getTopItems,
);

vendorRoute.get(
  "/dashboard/order-status-breakdown",
  authMiddleware,
  roleMiddleware("vendor"),
  vendorControllers.orderStatusBreakdown,
);

vendorRoute.get(
  "/dashboard/daily-revenue",
  authMiddleware,
  roleMiddleware("vendor"),
  vendorControllers.revenueStatsPerWeek,
);

vendorRoute.get(
  "/dashboard/average-order-value",
  authMiddleware,
  roleMiddleware("vendor"),
  vendorControllers.averageOrderValue,
);

vendorRoute.patch(
  "/menu/:menuId/stock",
  authMiddleware,
  roleMiddleware("vendor"),
  blockMiddleware,
  vendorControllers.updateStock,
);

vendorRoute.get(
  "/inventory",
  authMiddleware,
  roleMiddleware("vendor"),
  vendorControllers.getAllMenu,
);

vendorRoute.get(
  "/inventory/low-stock",
  authMiddleware,
  roleMiddleware("vendor"),
  vendorControllers.lowStockItems,
);

vendorRoute.post(
  "/menu/bulk-upload",
  authMiddleware,
  roleMiddleware("vendor"),
  blockMiddleware,
  upload.array("images", 50),
  vendorControllers.bulkUpload,
);

export default vendorRoute;
