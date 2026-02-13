# Glowverse API Reference

**Version:** 1.0.0
**Base URL:** `https://api.glowverse.com/api/v1`

## Authentication
Authentication is handled via JWT Bearer tokens. Include the token in the `Authorization` header.
`Authorization: Bearer <your_access_token>`

### Error Responses
| Code | Meaning | Description |
|------|---------|-------------|
| 400 | Bad Request | Validation failure or malformed request. |
| 401 | Unauthorized | Missing or invalid authentication token. |
| 403 | Forbidden | User does not have permission to access resource. |
| 404 | Not Found | The requested resource does not exist. |
| 429 | Too Many Requests | Rate limit exceeded. |
| 500 | Server Error | Internal server error. |

---

## 1. Authentication Module

### Register User
Create a new user account.

- **Endpoint:** `POST /auth/register`
- **Body:**
```json
{
  "email": "user@example.com", // Required, unique
  "password": "Password123!", // Required, min 8 chars
  "name": "Jane Doe", // Required
  "referralCode": "REF123" // Optional
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Jane Doe"
    },
    "tokens": {
      "accessToken": "ey...",
      "refreshToken": "ey..."
    }
  }
}
```

### Login
Authenticate an existing user.

- **Endpoint:** `POST /auth/login`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```
- **Response (200 OK):** standard auth response (see Register).

### Refresh Token
Get a new access token using a refresh token.

- **Endpoint:** `POST /auth/refresh-token`
- **Body:**
```json
{
  "refreshToken": "ey..."
}
```

---

## 2. User Management

### Get Profile
Get current user's profile.

- **Endpoint:** `GET /users/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Jane Doe",
      "role": "USER",
      "profile": {
        "skinType": "OILY",
        "skinTone": "FAIR"
      }
    }
  }
}
```

### Update Profile
Update profile information.

- **Endpoint:** `PATCH /users/me`
- **Body:**
```json
{
  "name": "Jane Smith",
  "preferences": {
    "marketingEmails": false
  }
}
```

---

## 3. Products & E-Commerce

### List Products
Retrieve a paginated list of products.

- **Endpoint:** `GET /products`
- **Query Parameters:**
    - `page` (int): Page number (default 1)
    - `limit` (int): Items per page (default 20)
    - `category` (string): Filter by category
    - `sort` (string): `price_asc`, `price_desc`, `newest`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Glow Serum",
        "price": 29.99,
        "stock": 100,
        "images": ["url1", "url2"]
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "pages": 3
    }
  }
}
```

### Get Product Details
- **Endpoint:** `GET /products/:id`

### Add to Cart
- **Endpoint:** `POST /cart/items`
- **Body:**
```json
{
  "productId": "uuid",
  "quantity": 2
}
```

### Checkout (Create Order)
- **Endpoint:** `POST /orders`
- **Body:**
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Tech City",
    "country": "US",
    "postalCode": "90210"
  },
  "paymentMethod": "CREDIT_CARD" // or PAYPAL
}
```

---

## 4. AR & AI Features (Perfect Corp Integration)

### AI Skin Analysis
Analyze a user's selfie for skin conditions.

- **Endpoint:** `POST /perfect-corp/analyze-skin`
- **Body:**
```json
{
  "imageUrl": "https://example.com/selfie.jpg" // Must be a valid public URL
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "skinAge": 25,
    "skinType": "COMBINATION",
    "concerns": [
      { "type": "wrinkles", "severity": "low" },
      { "type": "acne", "severity": "medium" }
    ]
  }
}
```

### Virtual Makeup Try-On
Apply virtual makeup products to an image.

- **Endpoint:** `POST /perfect-corp/try-on`
- **Body:**
```json
{
  "imageUrl": "https://example.com/selfie.jpg",
  "products": [
    { "sku": "LIP-RED-001", "type": "lipstick" },
    { "sku": "EYE-SHADOW-BLUE", "type": "eyeshadow" }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "resultImageUrl": "https://api.perfectcorp.com/result/xyz.jpg"
  }
}
```

---

## 5. Content & Community

### List Guides
- **Endpoint:** `GET /guides`
- **Query Params:** `category`, `search`

### Create Guide (Creators/Admins)
- **Endpoint:** `POST /guides`
- **Body:**
```json
{
  "title": "Summer Skincare Routine",
  "content": "Step 1: Cleanse...",
  "category": "SKINCARE",
  "tags": ["summer", "spf"]
}
```

### Fitness Activity Log
- **Endpoint:** `POST /fitness/activities`
- **Body:**
```json
{
  "type": "YOGA",
  "duration": 45, // minutes
  "caloriesBurned": 150,
  "date": "2023-10-27T08:00:00Z"
}
```
