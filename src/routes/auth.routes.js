import { Router } from "express";
import authControllers from "../controllers/auth.controllers.js";
import validators from "../validators/auth.validators.js";
import { authMiddleware, setAuthRole } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import passport from "../config/passport.js";
const authRouter = Router();

authRouter.post(
  "/user/register",
  setAuthRole("user"),
  validators.registerValidationRules,
  authControllers.register,
);
authRouter.post(
  "/user/refresh-token",
  setAuthRole("user"),
  authControllers.refreshToken,
);
authRouter.post("/user/logout", setAuthRole("user"), authControllers.logout);
authRouter.post(
  "/user/logout-all",
  setAuthRole("user"),
  authControllers.logoutAll,
);
authRouter.post(
  "/user/login",
  setAuthRole("user"),
  validators.loginValidationRules,
  authControllers.login,
);
authRouter.post(
  "/user/resend-otp",
  setAuthRole("user"),
  validators.resendOtpValidationRules,
  authControllers.resendOTP,
);
authRouter.post(
  "/user/verify-email",
  setAuthRole("user"),
  validators.verifyEmailValidationRules,
  authControllers.verifyEmail,
);
authRouter.post(
  "/user/forgot-password",
  setAuthRole("user"),
  validators.resendOtpValidationRules,
  authControllers.forgotPassword,
);
authRouter.post(
  "/user/verify-reset-otp",
  setAuthRole("user"),
  validators.verifyEmailValidationRules,
  authControllers.verifyResetOtp,
);
authRouter.post(
  "/user/reset-password",
  setAuthRole("user"),
  validators.resetPasswordValidationRules,
  authControllers.resetPassword,
);

authRouter.post(
  "/vendor/register",
  setAuthRole("vendor"),
  validators.registerValidationRules,
  authControllers.register,
);
authRouter.post(
  "/vendor/refresh-token",
  setAuthRole("vendor"),
  authControllers.refreshToken,
);
authRouter.post("/vendor/logout", setAuthRole("vendor"), authControllers.logout);
authRouter.post(
  "/vendor/logout-all",
  setAuthRole("vendor"),
  authControllers.logoutAll,
);
authRouter.post(
  "/vendor/login",
  setAuthRole("vendor"),
  validators.loginValidationRules,
  authControllers.login,
);
authRouter.post(
  "/vendor/resend-otp",
  setAuthRole("vendor"),
  validators.resendOtpValidationRules,
  authControllers.resendOTP,
);
authRouter.post(
  "/vendor/verify-email",
  setAuthRole("vendor"),
  validators.verifyEmailValidationRules,
  authControllers.verifyEmail,
);
authRouter.post(
  "/vendor/forgot-password",
  setAuthRole("vendor"),
  validators.resendOtpValidationRules,
  authControllers.forgotPassword,
);
authRouter.post(
  "/vendor/verify-reset-otp",
  setAuthRole("vendor"),
  validators.verifyEmailValidationRules,
  authControllers.verifyResetOtp,
);
authRouter.post(
  "/vendor/reset-password",
  setAuthRole("vendor"),
  validators.resetPasswordValidationRules,
  authControllers.resetPassword,
);

authRouter.post(
  "/delivery-partner/register",
  setAuthRole("delivery_partner"),
  validators.registerValidationRules,
  authControllers.register,
);
authRouter.post(
  "/delivery-partner/refresh-token",
  setAuthRole("delivery_partner"),
  authControllers.refreshToken,
);
authRouter.post(
  "/delivery-partner/logout",
  setAuthRole("delivery_partner"),
  authControllers.logout,
);
authRouter.post(
  "/delivery-partner/logout-all",
  setAuthRole("delivery_partner"),
  authControllers.logoutAll,
);
authRouter.post(
  "/delivery-partner/login",
  setAuthRole("delivery_partner"),
  validators.loginValidationRules,
  authControllers.login,
);
authRouter.post(
  "/delivery-partner/resend-otp",
  setAuthRole("delivery_partner"),
  validators.resendOtpValidationRules,
  authControllers.resendOTP,
);
authRouter.post(
  "/delivery-partner/verify-email",
  setAuthRole("delivery_partner"),
  validators.verifyEmailValidationRules,
  authControllers.verifyEmail,
);
authRouter.post(
  "/delivery-partner/forgot-password",
  setAuthRole("delivery_partner"),
  validators.resendOtpValidationRules,
  authControllers.forgotPassword,
);
authRouter.post(
  "/delivery-partner/verify-reset-otp",
  setAuthRole("delivery_partner"),
  validators.verifyEmailValidationRules,
  authControllers.verifyResetOtp,
);
authRouter.post(
  "/delivery-partner/reset-password",
  setAuthRole("delivery_partner"),
  validators.resetPasswordValidationRules,
  authControllers.resetPassword,
);

authRouter.post(
  "/admin/register",
  authMiddleware,
  roleMiddleware("admin"),
  setAuthRole("admin"),
  validators.registerValidationRules,
  authControllers.register,
);
authRouter.post(
  "/admin/refresh-token",
  setAuthRole("admin"),
  authControllers.refreshToken,
);
authRouter.post("/admin/logout", setAuthRole("admin"), authControllers.logout);
authRouter.post(
  "/admin/logout-all",
  setAuthRole("admin"),
  authControllers.logoutAll,
);
authRouter.post(
  "/admin/login",
  setAuthRole("admin"),
  validators.loginValidationRules,
  authControllers.login,
);
authRouter.post(
  "/admin/resend-otp",
  setAuthRole("admin"),
  validators.resendOtpValidationRules,
  authControllers.resendOTP,
);
authRouter.post(
  "/admin/verify-email",
  setAuthRole("admin"),
  validators.verifyEmailValidationRules,
  authControllers.verifyEmail,
);
authRouter.post(
  "/admin/forgot-password",
  setAuthRole("admin"),
  validators.resendOtpValidationRules,
  authControllers.forgotPassword,
);
authRouter.post(
  "/admin/verify-reset-otp",
  setAuthRole("admin"),
  validators.verifyEmailValidationRules,
  authControllers.verifyResetOtp,
);
authRouter.post(
  "/admin/reset-password",
  setAuthRole("admin"),
  validators.resetPasswordValidationRules,
  authControllers.resetPassword,
);

authRouter.get("/me", authMiddleware, authControllers.getMe);
authRouter.patch("/me", authMiddleware, authControllers.updateProfile);
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

authRouter.get(
  "/google/callback",

  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/google/failure",
  }),

  authControllers.googleLogin,
);
export default authRouter;
