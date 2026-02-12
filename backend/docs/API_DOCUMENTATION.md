# Glowverse API Documentation

## Overview
Base URL: `/api/v1`

## Authentication
Most endpoints require a Bearer token.
Header: `Authorization: Bearer <token>`

### Register
`POST /auth/register`
**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "Test User"
}
```
**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "name": "Test User" },
    "tokens": { "accessToken": "jwt...", "refreshToken": "jwt..." }
  }
}
```

### Login
`POST /auth/login`
**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```
**Response (200):** Same as Register.

### Refresh Token
`POST /auth/refresh-token`
**Body:** `{ "refreshToken": "jwt..." }`

---

## Users

### Get Profile
`GET /users/me`
**Auth:** Required
**Response (200):**
```json
{
  "success": true,
  "data": { "user": { "id": "uuid", "email": "...", "profile": { ... } } }
}
```

### Update Profile
`PATCH /users/me`
**Auth:** Required
**Body:** `{ "name": "New Name" }`

---

## Products

### List Products
`GET /products`
**Query Params:**
- `page` (default 1)
- `limit` (default 20)
- `category` (optional)
- `sort` (price_asc, price_desc, newest)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [ ... ],
    "total": 100,
    "page": 1,
    "pages": 5
  }
}
```

### Get Product
`GET /products/:id`

### Search Products
`GET /products/search?q=query`

---

## Cart

### Get Cart
`GET /cart`
**Auth:** Required
**Response (200):**
```json
{
  "success": true,
  "data": { "cart": { "items": [ ... ], "total": 50.00 } }
}
```

### Add Item
`POST /cart/items`
**Auth:** Required
**Body:**
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

### Update Item
`PATCH /cart/items/:itemId`
**Body:** `{ "quantity": 2 }`

### Remove Item
`DELETE /cart/items/:itemId`

---

## Orders

### Create Order
`POST /orders`
**Auth:** Required
**Body:**
```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "addressLine1": "123 St",
    "city": "City",
    "state": "ST",
    "postalCode": "12345",
    "country": "US"
  },
  "paymentMethod": "credit_card"
}
```

### List Orders
`GET /orders`

### Get Order
`GET /orders/:id`

### Cancel Order
`PATCH /orders/:id/cancel`
**Body:** `{ "reason": "Changed mind" }`

---

## Notifications

### List Notifications
`GET /notifications`
**Auth:** Required

### Mark As Read
`PATCH /notifications/:id/read`

### Delete Notification
`DELETE /notifications/:id`

---

## Promotions

### Validate Promotion
`POST /promotions/validate`
**Auth:** Required
**Body:**
```json
{
  "code": "WELCOME10",
  "cartTotal": 50
}
```

---

## Fitness

### Log Activity
`POST /fitness/activities`
**Auth:** Required
**Body:**
```json
{
  "type": "RUNNING",
  "duration": 30,
  "caloriesBurned": 200,
  "date": "2025-01-01T10:00:00Z"
}
```

### Get Stats
`GET /fitness/stats`

---

## Guides

### List Guides
`GET /guides`
**Query Params:** `category`, `page`, `search`

### Get Guide
`GET /guides/:id`

### Like Guide
`POST /guides/:id/like`

### Bookmark Guide
`POST /guides/:id/bookmark`

---

## Search

### Global Search
`GET /search`
**Query Params:** `q` (query), `types` (products,guides)

### Suggestions
`GET /search/suggestions?q=query`

### Popular Searches
`GET /search/popular`

---

## Errors
Standard format:
```json
{
  "success": false,
  "message": "Error description"
}
```
- **400**: Bad Request (Validation)
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Server Error
