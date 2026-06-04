import {Router} from 'express';
import authControllers from '../controllers/auth.controllers.js';
import validators from '../validators/auth.validators.js';
const authRouter  = Router();


authRouter.post('/register',validators.registerValidationRules,authControllers.register)
authRouter.post('/refresh-token',validators.loginValidationRules,authControllers.resfreshToken)
authRouter.post('/logout',validators.loginValidationRules,authControllers.logout)
authRouter.post('/logout-all',validators.loginValidationRules,authControllers.logoutAll)
authRouter.post('/login',validators.loginValidationRules,authControllers.login)
authRouter.post('/verify-email',validators.verifyEmailValidationRules,authControllers.verifyEmail)
export default authRouter