export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "src/controllers/auth.controllers.js",
    "src/controllers/admin.controllers.js",
    "src/controllers/cart.controllers.js",
    "src/routes/auth.routes.js",
    "src/routes/admin.routes.js",
    "src/routes/cart.routes.js",
    "src/models/cart.models.js",
    "src/middlewares/auth.middlewares.js",
    "src/middlewares/role.middleware.js",
    "src/middlewares/block.middlewares.js",
    "src/utils/cartTotal.js",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 85,
      lines: 75,
      statements: 75,
    },
  },
};
