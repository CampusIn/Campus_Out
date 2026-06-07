import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import restaurantRoute from './routes/restaurant.routes.js';
import menuRouter from './routes/menu.routes.js';
import ApiError from './utils/apiErrors.js';


const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api/auth',authRouter)
app.use('/api',restaurantRoute)
app.use('/api/restaurants',menuRouter)

app.use((err, req, res, next) => {
    const statusCode = err instanceof ApiError ? err.statusCode : 500;

    return res.status(statusCode).json({
        statusCode,
        data: null,
        message: err.message || "Internal server error",
        success: false,
        errors: err.errors || []
    })
})

export default app;
