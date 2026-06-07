import {Router} from 'express';
import authControllers from '../controllers/auth.controllers.js';
import validators from '../validators/auth.validators.js';
import {  authMiddleware  } from '../middlewares/auth.middlewares.js';
import roleMiddleware from '../middlewares/role.middleware.js';
const authRouter  = Router();


authRouter.post('/register',validators.registerValidationRules,authControllers.register)
authRouter.post('/refresh-token',authControllers.refreshToken)
authRouter.post('/logout',authControllers.logout)
authRouter.post('/logout-all',authControllers.logoutAll)
authRouter.post('/login',validators.loginValidationRules,authControllers.login)
authRouter.post('/verify-email',validators.verifyEmailValidationRules,authControllers.verifyEmail)
export default authRouter