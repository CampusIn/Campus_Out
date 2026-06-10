# CAMPUS OUT

A Node.js + Express API for user authentication, email verification, session-based token refresh, and vendor-managed restaurant/menu resources.

> **Status:** in progress. The core auth and restaurant flows are implemented, but the project is not complete yet and will continue to expand.

## What is implemented now

- User registration with email verification
- Login with JWT access tokens and refresh-token cookie sessions
- Logout and logout-all-session support
- Role-based access control for vendor routes
- Restaurant CRUD-style endpoints for vendors
- Menu item creation and retrieval for restaurants
- Centralized validation, error handling, and API response helpers

## Core modules

- **Auth**: registration, login, OTP verification, token refresh, and session logout
- **Restaurant management**: create, update, view, delete, and toggle restaurant status
- **Menu management**: create, fetch, update, toggle availability, and delete menu items
- **Infrastructure**: MongoDB connection, request validation, error wrappers, and mail delivery

## Data model overview

- **User**: stores username, email, password hash, role, and verification state
- **Session**: stores hashed refresh tokens and device metadata for logout/rotation
- **OTP**: stores hashed verification codes for email confirmation
- **Restaurant**: stores vendor-owned restaurant details and status
- **Menu item**: stores restaurant-linked items such as name, price, category, and image

## Tech stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB with Mongoose
- **Auth:** JSON Web Tokens, bcrypt, cookie-based refresh tokens
- **Email:** Nodemailer
- **Validation:** express-validator

## Prerequisites

- Node.js
- MongoDB instance
- Gmail/OAuth email credentials for verification mail delivery

## Environment variables

The app validates these values on startup:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_USER=your_gmail_address
```

## Development notes

- The server uses JSON request bodies and cookie-based refresh tokens.
- Access tokens must be sent in the `Authorization` header as `Bearer <token>`.
- Refresh cookies are marked `httpOnly`, `secure`, and `sameSite=strict`, so HTTPS is required in environments where the browser must persist the cookie.
- Most restaurant and menu write operations are restricted to users with the `vendor` role.
- Several routes also verify resource ownership before allowing updates or deletes.

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the server

   ```bash
   npm run dev
   ```

## API overview

### Auth

Base path: `/api/auth`

- `POST /register`
- `POST /login`
- `POST /verify-email`
- `POST /refresh-token`
- `POST /logout`
- `POST /logout-all`

Expected request fields:

- `POST /register`: `username`, `email`, `password`, optional `role`
- `POST /login`: `email`, `password`
- `POST /verify-email`: `email`, `otp`

### Restaurants

Base path: `/api`

- `POST /restaurants` — vendor only
- `PATCH /restaurants/:id` — vendor only
- `GET /restaurants/my` — vendor only
- `GET /restaurants/:id` — authenticated owner-only lookup
- `DELETE /restaurants/:id` — vendor only
- `PATCH /restaurants/:id/status` — vendor only
- `GET /restaurants` — public listing of open restaurants
- `GET /restaurant/:id` — public fetch of a single open restaurant by id

Expected request fields and behavior:

- `POST /restaurants`: creates a restaurant (vendor only). Body: `restaurantName`, `phone`, `description`, `location`, `category`.
- `PATCH /restaurants/:id`: updates a restaurant (vendor only & owner-only). Accepts editable fields: `restaurantName`, `description`, `category`, `phone`, `email`, `logo`, `banner`, `location`, `deliveryTime`, `minimumOrder`, `isOpen`.
- `GET /restaurants/my`: returns restaurants owned by the authenticated vendor.
- `GET /restaurants/:id`: authenticated route that returns the restaurant only to its owner (vendor).
- `DELETE /restaurants/:id`: deletes a restaurant (vendor only & owner-only).
- `PATCH /restaurants/:id/status`: toggles open/closed (vendor only & owner-only). Body: `isOpen` (boolean).
- `GET /restaurants`: public listing of open restaurants. Supports query params: `search` (partial name match), `page` (default 1), `limit` (default 10).
- `GET /restaurant/:id`: public fetch of a single open restaurant by id — returns a limited projection (owner and `minimumOrder` omitted).

### Menu

Base path: `/api/restaurants`

- `POST /:restaurantId/menu` — vendor only
- `GET /:restaurantId/menu`
- `GET /menu/:id`
- `PATCH /menu/:id` — vendor only
- `PATCH /menu/:id/status` — vendor only
- `DELETE /menu/:id` — vendor only

Expected request fields:

- `POST /:restaurantId/menu`: `name`, `description`, `price`, `category`, `image`
- `PATCH /menu/:id`: editable menu fields supported by the controller
- `PATCH /menu/:id/status`: `isAvailable`

Notes:

- Menu updates and deletes use ownership checks, so vendors can only manage their own menu items.
- Deleting a menu item is soft delete; the item is marked deleted instead of being removed from the database.

### Cart

Base path: `/api/user`

- `POST /cart/items` — authenticated `user` only; adds items to the authenticated user's cart.

Behavior and request fields:

- Routes:
  - `POST /cart/items` — adds items to the authenticated user's cart (returns `201 Created`).
  - `GET /cart/items` — fetches the authenticated user's cart (returns `200 OK`).
  - `PATCH /cart/items/:menuItemId` — updates an item's quantity in the cart (returns `200 OK`).
  - `DELETE /cart/items/:menuItemId` — removes a single item from the cart (returns `200 OK`).
  - `DELETE /cart` — deletes the authenticated user's entire cart (returns `200 OK`).

- Request body for add/update: `menuItemId` (ObjectId), `quantity` (number, >= 1).
- Validation and errors:
  - `menuItemId` must be a valid MongoDB ObjectId — otherwise `400 Bad Request`.
  - `quantity` must be >= 1 — otherwise `400 Bad Request`.
  - Adding items from different restaurants returns `409 Conflict`.
  - If a referenced menu item no longer exists or is unavailable, requests will fail with `400`.

- Behavior details:
  - A `cartTotal` utility is used by the controllers to recompute and persist `totalAmount` after add, update, and delete operations. Totals are computed from the current `menu.price` values.
  - If the user has no existing cart, a new cart is created on first add with the `restaurant` set to the added item's restaurant.
  - When deleting an item, if it was the last item in the cart the cart document is removed and the API responds with an empty cart (restaurant `null`, empty `items`, `totalAmount: 0`).
  - `GET /cart/items` populates the `restaurant` (selecting `restaurantName`) and each `items.menuItem` (selecting `name`, `price`, `image`). The controller filters out any items whose referenced `menuItem` no longer exists before returning results and recalculates `totalAmount`.

Model summary (`Cart`):

- `user`: ObjectId (ref `User`, unique) — owner of the cart.
- `restaurant`: ObjectId (ref `Restaurant`) — restaurant associated with the cart items.
- `items`: array of `{ menuItem: ObjectId (ref `Menu`), quantity: Number }`.
- `totalAmount`: Number — computed total for the cart and persisted after changes.

## Authentication flow

- Register with `username`, `email`, and `password`
- Verify the account with the OTP sent by email
- Log in to receive an access token
- Send the access token as:

  ```http
  Authorization: Bearer <accessToken>
  ```

- Refresh tokens are stored in an `httpOnly` cookie

## Current limitations

- The project is still under active development.
- There are no automated tests yet.
- API documentation is intentionally lightweight and will expand as more features are added.
- Production deployment settings, observability, and hardening are not finished.

## Project structure

```text
src/
  config/         environment and database setup
  controllers/    route handlers
  middlewares/    auth and role guards
  models/         Mongoose schemas
  routes/         API route definitions
  services/       email delivery
  utils/          shared helpers and response/error wrappers
  validators/     request validation rules
```

## Planned next steps

- Expand restaurant and menu management features
- Add more user-facing flows and profile management
- Improve documentation and examples as the API grows
- Add tests and deployment-ready configuration

