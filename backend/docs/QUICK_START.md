# Quick Start Guide: Glowverse API

Welcome to the Glowverse API! This guide will help you make your first API request in minutes.

## Prerequisites
- A REST API Client (Postman, Insomnia, or `curl`)
- Basic understanding of JSON and HTTP.

## Step 1: Base URL
All API requests should be prefixed with:
**Development:** `http://localhost:5000/api/v1`
**Production:** `https://api.glowverse.com/api/v1`

## Step 2: Register a User
To access protected endpoints, you first need to create an account.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "password": "StrongPassword123!",
    "name": "Developer"
  }'
```

**Response:**
You will receive a JSON response containing an `accessToken`.
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      ...
    }
  }
}
```
**Copy this token!** You will need it for the next steps.

## Step 3: Authenticate Requests
Most endpoints require the Access Token to be sent in the `Authorization` header.

**Header Format:** 
`Authorization: Bearer <YOUR_ACCESS_TOKEN>`

## Step 4: Make Your First Protected Call
Let's retrieve your user profile.

**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "developer@example.com",
      "name": "Developer"
    }
  }
}
```

## Step 5: Explore Products
You can list products without authentication.

**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/products?limit=5
```

## Next Steps
- Read the [API Reference](API_REFERENCE.md) for full endpoint details.
- Check out the [Integration Guides](INTEGRATION_GUIDES.md) for complex workflows.
