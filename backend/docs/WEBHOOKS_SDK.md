# Webhooks & SDK Documentation

## Webhooks
Webhooks allow your external systems to receive real-time notifications about events in Glowverse.

### Configuration
Endpoints for webhooks can be registered via the API (future feature) or configured in the database.

### Event Format
All webhook events follow this JSON structure:
```json
{
  "id": "evt_...",
  "event": "EVENT_NAME",
  "data": { ... },
  "timestamp": "ISO_8601_TIMESTAMP"
}
```

### Supported Events

| Event Name | Description | Data Payload |
|------------|-------------|--------------|
| `ORDER_CREATED` | Triggered when a new order is placed. | Order object, Customer info |
| `ORDER_STATUS_UPDATED` | Triggered when order status changes (e.g., SHIPPED). | Order ID, New Status |
| `USER_REGISTERED` | Triggered on new user signup. | User ID, Email |
| `INVENTORY_LOW` | Triggered when product stock is below threshold. | Product ID, Current Stock |

### Security
Validate webhook integrity using the `X-Glowverse-Signature` header. The signature is a HMAC-SHA256 hash of the payload using your Webhook Secret.

---

## JavaScript/TypeScript SDK Guide
While we provide a REST API, here is a recommended pattern for a TypeScript SDK to interact with our backend.

### Setup
`npm install axios`

### Client Implementation
```typescript
import axios, { AxiosInstance } from 'axios';

export class GlowverseClient {
  private client: AxiosInstance;

  constructor(baseURL: string, token?: string) {
    this.client = axios.create({
      baseURL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  // Auth
  async login(credentials: LoginDto) {
    const { data } = await this.client.post('/auth/login', credentials);
    return data;
  }

  // Users
  async getProfile() {
    const { data } = await this.client.get('/users/me');
    return data;
  }

  // Products
  async getProducts(params?: ProductQueryParams) {
    const { data } = await this.client.get('/products', { params });
    return data;
  }
}
```

### Usage
```typescript
const api = new GlowverseClient('https://api.glowverse.com/api/v1', 'YOUR_TOKEN');
const profile = await api.getProfile();
console.log(profile);
```
