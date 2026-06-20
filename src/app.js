import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import restaurantRoute from './routes/restaurant.routes.js';
import menuRouter from './routes/menu.routes.js';
import cartRouter from './routes/cart.routes.js';
import orderRouter from './routes/order.routes.js';
import reviewRoute from './routes/review.routes.js';
import adminRouter from './routes/admin.routes.js';
import ApiError from './utils/apiErrors.js';
import cors from "cors";


const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',   
  credentials: true,                 
}));

app.use('/api/auth',authRouter)
app.use('/api',restaurantRoute)
app.use('/api/restaurants',menuRouter)
app.use('/api/user',cartRouter)
app.use('/api/user',orderRouter)
app.use('/api/user',reviewRoute)
app.use('/api/admin',adminRouter)

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
