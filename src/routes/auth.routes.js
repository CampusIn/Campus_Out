import { Router } from "express";
import authControllers from "../controllers/auth.controllers.js";
import validators from "../validators/auth.validators.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import passport from "../config/passport.js";
const authRouter = Router();

authRouter.post(
  "/register",
  validators.registerValidationRules,
  authControllers.register,
);
authRouter.post("/refresh-token", authControllers.refreshToken);
authRouter.post("/logout", authControllers.logout);
authRouter.post("/logout-all", authControllers.logoutAll);
authRouter.post(
  "/login",
  validators.loginValidationRules,
  authControllers.login,
);

authRouter.post(
  "/resend-otp",
  validators.resendOtpValidationRules,
  authControllers.resendOTP
);
authRouter.post(
  "/verify-email",
  validators.verifyEmailValidationRules,
  authControllers.verifyEmail,
);

authRouter.post(
  "/forgot-password",
  validators.resendOtpValidationRules,
  authControllers.forgotPassword
);

authRouter.post(
  "/verify-reset-otp",
  validators.verifyEmailValidationRules,
  authControllers.verifyResetOtp
);

authRouter.post(
  "/reset-password",
  validators.resetPasswordValidationRules,
  authControllers.resetPassword
)
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
