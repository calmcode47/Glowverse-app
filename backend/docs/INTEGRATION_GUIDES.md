# Glowverse Integration Guides

This document provides step-by-step guides for integrating with complex Glowverse features.

## 1. E-Commerce Integration

### Complete Purchase Flow with AR
This workflow combines the AR Try-On feature with a purchase.

1.  **User Try-On**:
    - Call `POST /perfect-corp/try-on` with the user's selfie and product SKU.
    - Display the result image to the user.

2.  **Add to Cart**:
    - If the user likes the look, get the `productId` associated with the SKU.
    - Call `POST /cart/items` with `productId` and `quantity`.

3.  **Checkout**:
    - Collect shipping address and payment method.
    - Call `POST /orders` to create the order.
    - The backend will validate stock and process the transaction.

---

## 2. Content Creator Workflow

### Publishing a Guide with Products
Creators can tag products in their guides to drive sales.

1.  **Upload Images**:
    - Call `POST /upload` to upload guide cover and step images.
    - Store the returned `url`.

2.  **Search Products**:
    - Use `GET /products/search?q=lipstick` to find products to tag.
    - Note the `id` of the products.

3.  **Create Guide**:
    - Call `POST /guides` with the content and `productIds` array.
    - Example Body:
      ```json
      {
        "title": "My Lipstick Routine",
        "content": "Step 1: Apply...",
        "images": ["url1"],
        "productIds": ["uuid-of-lipstick"]
      }
      ```

---

## 3. Webhooks & Events

### Configuring Webhooks
Register a URL to receive real-time updates for specific events.

- **Endpoint:** `POST /webhooks`
- **Body:**
  ```json
  {
    "url": "https://your-backend.com/webhook",
    "events": ["ORDER_CREATED", "ORDER_SHIPPED"]
  }
  ```

### Event: ORDER_CREATED
Payload sent when a new order is placed.
```json
{
  "event": "ORDER_CREATED",
  "data": {
    "orderId": "uuid",
    "total": 59.99,
    "customer": "user@example.com"
  },
  "timestamp": "2023-10-27T10:00:00Z"
}
```

### Security
Verify the webhook signature in the `X-Glowverse-Signature` header using your strict secret.
