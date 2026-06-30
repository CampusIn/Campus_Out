# CAMPUS OUT

Campus Out is a Node.js and Express REST API for a campus food ordering platform. It supports email-verified authentication, role-based access, vendor restaurant/menu management, user cart and order flows, reviews, admin moderation, and account/restaurant blocking controls.

> Status: in progress. The main backend workflows are implemented, but deployment hardening, complete test coverage, and full production documentation are still ongoing.

## Features

- Email-based user registration with OTP verification.
- JWT access tokens with cookie-based refresh sessions.
- Role-based access control for `user`, `vendor`, and `admin` roles.
- Blocked-user protection on protected user/vendor actions.
- Restaurant suspension checks for vendor-owned restaurant and menu operations.
- Vendor restaurant management with owner-only updates, activation, and deletion controls.
- Menu management with image upload support through Multer and Cloudinary.
- User cart management with single-restaurant cart enforcement and recalculated totals.
- Order creation from cart snapshots, user order history, cancellation, and vendor status updates.
- Restaurant reviews from users who have delivered orders.
- Automatic restaurant rating and review-count updates.
- Admin dashboard metrics, user/vendor blocking, restaurant suspension, and order lookup tools.
- Centralized API responses, error handling, async route wrapping, and validation helpers.

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Tokens
- bcrypt
- cookie-parser
- express-validator
- Nodemailer
- Multer
- Cloudinary
- Morgan
- CORS

## Project Structure

```text
src/
  config/         Environment validation and database setup
  controllers/    Route handler logic
  middlewares/    Authentication, role checks, block checks, suspension checks, and upload handling
  models/         Mongoose schemas
  routes/         API route definitions
  services/       Email and Cloudinary integrations
  utils/          Shared helpers, API responses, errors, totals, ratings, and stats
  validators/     Request validation rules
```

## Environment Variables

The app validates required environment variables on startup.

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_USER=your_gmail_address

CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GOOGLE_CLIENT_ID=your_google_login_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_login_oauth_client_secret
GOOGLE_CALLBACK_URL=https://campus-out.onrender.com/api/auth/google/callback
CLIENT_URL=https://campus-out-frontend.vercel.app
```

## Setup

1. Install dependencies.

   ```bash
   npm install
   ```

2. Create a `.env` file with the variables listed above.

3. Start the development server.

   ```bash
   npm run dev
   ```

The Express app enables JSON request bodies, request logging, cookies, and CORS for `http://localhost:5173` plus `CLIENT_URL` with credentials enabled.

## Authentication

Base path: `/api/auth`

| Method | Endpoint         | Description                                            |
| ------ | ---------------- | ------------------------------------------------------ |
| POST   | `/register`      | Register a user and send an OTP email.                 |
| POST   | `/verify-email`  | Verify email with OTP and create a session.            |
| POST   | `/login`         | Log in and receive an access token.                    |
| POST   | `/refresh-token` | Rotate the refresh token and issue a new access token. |
| POST   | `/logout`        | Revoke the current refresh-token session.              |
| POST   | `/logout-all`    | Revoke all active sessions for the user.               |

Request bodies:

- `POST /register`: `username`, `email`, `password`, optional `role`.
- `POST /verify-email`: `email`, `otp`.
- `POST /login`: `email`, `password`.

Use the access token on protected routes:

```http
Authorization: Bearer <accessToken>
```

Refresh tokens are stored in an `httpOnly` cookie named `refreshToken`. For HTTPS frontend deployments, the cookie is sent as `secure` with `sameSite: none`; for local development it uses `sameSite: lax`.

Middleware behavior:

- `authMiddleware` reads the bearer token from the `Authorization` header and attaches `req.user`.
- `roleMiddleware(role)` blocks requests that do not match the required role.
- `blockMiddleware` blocks users whose `isBlocked` flag is `true`.
- `restaurantSuspensionMiddleware` blocks vendor actions when the vendor-owned restaurant is suspended.

## Restaurants

Base path: `/api`

| Method | Endpoint                  | Access              | Description                                            |
| ------ | ------------------------- | ------------------- | ------------------------------------------------------ |
| POST   | `/restaurants`            | Vendor              | Create a restaurant owned by the authenticated vendor. |
| PATCH  | `/restaurants/:id`        | Vendor owner        | Update allowed restaurant fields.                      |
| GET    | `/restaurants/my`         | Vendor              | Fetch restaurants owned by the authenticated vendor.   |
| GET    | `/restaurants/:id`        | Authenticated owner | Fetch a restaurant for its owner.                      |
| DELETE | `/restaurants/:id`        | Vendor owner        | Delete a restaurant.                                   |
| PATCH  | `/restaurants/:id/status` | Vendor owner        | Update `isOpen`.                                       |
| GET    | `/restaurants`            | Public              | List open restaurants.                                 |
| GET    | `/restaurant/:id`         | Public              | Fetch one open restaurant.                             |

Create body:

```json
{
  "restaurantName": "Campus Cafe",
  "phone": "9876543210",
  "description": "Quick meals and snacks",
  "location": "Main block",
  "category": "Cafe"
}
```

Public listing query parameters:

- `search`: partial restaurant-name search.
- `category`: filter by category.
- `page`: page number, default `1`.
- `limit`: page size, default `10`.

Restaurant categories include `Fast Food`, `Cafe`, `Bakery`, `South Indian`, `North Indian`, `Chinese`, and `Other`.

Vendor restaurant update/status and menu operations pass through both `blockMiddleware` and `restaurantSuspensionMiddleware`, so blocked users and vendors with suspended restaurants cannot mutate those resources.

## Menu

Base path: `/api/restaurants`

| Method | Endpoint              | Access       | Description                               |
| ------ | --------------------- | ------------ | ----------------------------------------- |
| POST   | `/:restaurantId/menu` | Vendor owner | Create a menu item for a restaurant.      |
| GET    | `/:restaurantId/menu` | Public       | Fetch active menu items for a restaurant. |
| GET    | `/menu/:id`           | Public       | Fetch one non-deleted menu item.          |
| PATCH  | `/menu/:id`           | Vendor owner | Update allowed menu fields.               |
| PATCH  | `/menu/:id/status`    | Vendor owner | Update availability.                      |
| DELETE | `/menu/:id`           | Vendor owner | Soft delete a menu item.                  |

Menu creation uses `multipart/form-data` and requires an uploaded file field named `image`. The uploaded file is temporarily stored in `public/temp`, uploaded to Cloudinary, and saved as the menu item's image URL.

Create fields:

- `name`
- `description`
- `price`
- `category`
- `image`

Status update body:

```json
{
  "isAvailable": true
}
```

Deleted menu items are marked with `isDeleted: true` instead of being removed from the database.

Menu management routes also enforce vendor ownership, blocked-user checks, and restaurant suspension checks before allowing create, update, status, or delete operations.

## Cart

Base path: `/api/user`

| Method | Endpoint                  | Access | Description                                   |
| ------ | ------------------------- | ------ | --------------------------------------------- |
| POST   | `/cart/items`             | User   | Add an item to the authenticated user's cart. |
| GET    | `/cart`                   | User   | Fetch the authenticated user's cart.          |
| PATCH  | `/cart/items/:menuItemId` | User   | Update an item's quantity.                    |
| DELETE | `/cart/items/:menuItemId` | User   | Remove one item from the cart.                |
| DELETE | `/cart`                   | User   | Clear the entire cart.                        |

Add/update body:

```json
{
  "menuItemId": "mongo_object_id",
  "quantity": 2
}
```

Cart behavior:

- A user can have one active cart.
- Cart items must belong to the same restaurant.
- Totals are recalculated from current menu prices after add, update, and delete operations.
- If the last item is removed, the cart document is deleted and an empty cart response is returned.
- Cart responses populate restaurant name and menu item details where available.
- Mutating cart routes are protected by `blockMiddleware`.

## Orders

Base path: `/api/user`

| Method | Endpoint                  | Access       | Description                               |
| ------ | ------------------------- | ------------ | ----------------------------------------- |
| POST   | `/order`                  | User         | Create an order from the user's cart.     |
| GET    | `/orders/my`              | User         | Fetch the user's order history.           |
| GET    | `/orders/:orderId`        | User owner   | Fetch one order.                          |
| PATCH  | `/orders/:orderId/cancel` | User owner   | Cancel a pending order.                   |
| GET    | `/order/restaurant`       | Vendor       | Fetch orders for the vendor's restaurant. |
| PATCH  | `/order/:orderId/status`  | Vendor owner | Update an order status.                   |

Create order body:

```json
{
  "paymentMethod": "COD"
}
```

Supported payment methods:

- `COD`
- `PAY_ON_PICKUP`

Order statuses:

- `PENDING`
- `CONFIRMED`
- `PREPARING`
- `READY`
- `DELIVERED`
- `CANCELLED`

Order behavior:

- Orders are created from the current cart.
- Each order stores a snapshot of item name, purchase price, and quantity.
- The cart is deleted after a successful order.
- Users can cancel only `PENDING` orders.
- Vendors can update orders for their own restaurant to `CONFIRMED`, `PREPARING`, `READY`, or `DELIVERED`.
- Delivered orders cannot be changed again.
- Order history and vendor order listing support `page` and `limit` query parameters.
- Order creation is protected by `blockMiddleware`.

## Reviews

Base path: `/api/user`

| Method | Endpoint                             | Access     | Description                       |
| ------ | ------------------------------------ | ---------- | --------------------------------- |
| POST   | `/reviews/:restaurantId`             | User       | Create a review for a restaurant. |
| GET    | `/restaurants/:restaurantId/reviews` | Public     | Fetch restaurant reviews.         |
| PATCH  | `/reviews/:reviewId`                 | User owner | Update a review.                  |
| DELETE | `/reviews/:reviewId`                 | User owner | Delete a review.                  |

Create/update body:

```json
{
  "rating": 5,
  "comment": "Great food and quick service."
}
```

Review behavior:

- Ratings must be between `1` and `5`.
- Users can review a restaurant only after having a `DELIVERED` order for it.
- Each user can review a restaurant only once.
- Updating or deleting a review recalculates the restaurant's `averageRating` and `reviewCount`.
- Review listing includes pagination and returns the restaurant rating summary.
- Review create, update, and delete actions are protected by `blockMiddleware`.

## Admin

Base path: `/api/admin`

All admin routes require authentication and the `admin` role.

| Method | Endpoint                    | Description                                      |
| ------ | --------------------------- | ------------------------------------------------ |
| GET    | `/dashboard`                | Fetch dashboard metrics.                         |
| GET    | `/dashboard/users`          | List users with search and pagination.           |
| GET    | `/dashboard/vendors`        | List vendors with search and pagination.         |
| GET    | `/dashboard/restaurants`    | List restaurants with filters and pagination.    |
| PATCH  | `/users/:id/block`          | Block a user.                                    |
| PATCH  | `/users/:id/unblock`        | Unblock a user.                                  |
| PATCH  | `/restaurants/:id/suspend`  | Suspend a restaurant.                            |
| PATCH  | `/restaurants/:id/activate` | Reactivate a suspended restaurant.               |
| GET    | `/orders`                   | List all orders with optional status filtering.  |
| GET    | `/orders/:id`               | Fetch a single order with user and item details. |

Dashboard metrics:

- `userCount`
- `vendorCount`
- `restaurantCount`
- `orderCount`
- `revenue`

Revenue is calculated from orders where `orderStatus` is `DELIVERED` by summing `totalAmount`.

Admin query parameters:

- Users/vendors: `search`, `page`, `limit`.
- Restaurants: `search`, `category`, `isOpen`, `page`, `limit`.
- Orders: `status`, `page`, `limit`.

Admin moderation behavior:

- Blocking a user sets `isBlocked` to `true`.
- Unblocking a user sets `isBlocked` to `false`.
- Suspending a restaurant sets `isSuspended` to `true`.
- Activating a restaurant sets `isSuspended` to `false`.

## Data Models

- `User`: username, email, password hash, verification state, role, and `isBlocked` moderation flag.
- `Session`: hashed refresh token, user, IP, user agent, and revoked state.
- `OTP`: hashed email verification code with expiry behavior.
- `Restaurant`: vendor owner, profile details, category, open/closed state, suspension state, rating average, and review count.
- `Menu`: restaurant, item details, price, availability, soft-delete state, and image URL.
- `Cart`: one cart per user with restaurant, items, quantities, and persisted total.
- `Order`: user, restaurant, restaurant name snapshot, item snapshots, total amount, payment method/status, order status, and order number.
- `Review`: user, restaurant, rating, comment, and uniqueness across user plus restaurant.

## Shared Utilities

- `ApiError`: standard error object with status codes and optional validation errors.
- `ApiResponse`: consistent JSON response wrapper.
- `asyncHandler`: wraps async controllers and forwards errors.
- `cartTotal`: recalculates cart totals from menu prices.
- `menuOwnership`: checks that a vendor owns the menu item's restaurant.
- `orderNumber`: generates readable unique order numbers.
- `revenueStats`: calculates delivered-order revenue for admin dashboard data.
- `updateRestaurantReview`: recalculates restaurant average rating and review count.
- `utils`: OTP generation and OTP email template helpers.

## API Response Shape

Most successful responses use the shared response helper:

```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": {},
  "success": true
}
```

Errors are handled centrally:

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Validation failed",
  "success": false,
  "errors": []
}
```

## Current Limitations

- The project is still under active development.
- There is no dedicated production start script yet.
- Automated test coverage and API examples can be expanded further.
- Production cookie, CORS, logging, monitoring, and deployment settings still need final hardening.
