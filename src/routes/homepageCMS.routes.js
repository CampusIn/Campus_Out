import {Router} from 'express';
import { authMiddleware } from '../middlewares/auth.middlewares.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import homePageController from '../controllers/homePageCMS.controllers.js';

const homePageRouter = Router()

homePageRouter.get(
    '/banners',
    authMiddleware,
    roleMiddleware('user'),
    homePageController.getActiveBanners
)

homePageRouter.get(
    '/announcements',
    authMiddleware,
    roleMiddleware('user'),
    homePageController.getActiveAnnouncements
)

export default homePageRouter