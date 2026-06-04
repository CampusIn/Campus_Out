import {Router} from 'express';
import authControllers from '../controllers/auth.controllers.js';
const authRouter  = Router();


authRouter.post('/register',authControllers.register)
authRouter.post('/refresh-token',authControllers.resfreshToken)
authRouter.post('/logout',authControllers.logout)
authRouter.post('/logout-all',authControllers.logoutAll)
authRouter.post('/login',authControllers.login)
authRouter.post('/verify-email',authControllers.verifyEmail)
export default authRouter