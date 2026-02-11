# Glowverse Backend API

**A comprehensive Node.js + Express + TypeScript backend for the Glowverse beauty and grooming platform, featuring e-commerce, AI-powered skin analysis, virtual try-on, fitness tracking, and content management.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-brightgreen.svg)](https://www.prisma.io/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)

---

## 🚀 Features

### Core Features
- **Authentication & Authorization** - JWT-based auth with role management
- **User Management** - Profile, preferences, avatar upload
- **Skin Analysis** - AI-powered facial analysis and recommendations
- **Virtual Try-On** - AR makeup try-on integration
- **Favorites/Wishlist** - Save products for later

### E-Commerce
- **Product Catalog** - 50+ products across categories (Skincare, Makeup, Haircare, Fragrance)
- **Shopping Cart** - Full cart management with persistence
- **Order Management** - Complete order processing and tracking
- **Payment Integration** - Ready for Stripe/PayPal integration

### Engagement
- **Notifications** - Real-time user notifications
- **Promotions** - Discount codes and special offers
- **Referral System** - User referrals with rewards

### Content & Wellness
- **Fitness Tracking** - Activity logging, goals, and statistics
- **Grooming Guides** - Step-by-step tutorials and educational content
- **Content Discovery** - Search, filter, trending content

### Integrations
- **PerfectCorp API** - AI/AR beauty features
- **Cloudinary** - Image upload and management
- **File Upload** - Multiple storage options

---

## 📊 API Statistics

- **79+ Endpoints** across 15 modules
- **4 Database Models** for e-commerce
- **4 Models** for guides & content
- **2 Models** for fitness tracking
- **3 Models** for promotions & referrals
- **100% TypeScript** - Fully typed codebase
- **60+ Integration Tests** - Comprehensive test coverage

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **TypeScript** | Type-safe JavaScript |
| **Express** | Web framework |
| **Prisma** | ORM and database toolkit |
| **PostgreSQL** | Production database |
| **SQLite** | Development database |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Jest** | Testing framework |
| **Cloudinary** | Image hosting |

---

## 📦 Installation

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL (production) or SQLite (development)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd Glowverse-app/backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run prisma:seed

# Start development server
npm run dev
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/glowverse"
# For development with SQLite:
# DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# PerfectCorp API (optional)
PERFECTCORP_API_KEY=your-perfectcorp-api-key
PERFECTCORP_API_SECRET=your-perfectcorp-secret
```

---

## 📚 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:deploy    # Deploy migrations (production)
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:integration # Run integration tests only

# Code Quality  
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Seeding
npm run seed:test        # Seed test data (50+ products)
```

---

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # Prisma client
│   │   └── env.ts       # Environment variables
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   │   └── index.ts     # Centralized route registration
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # Authentication
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validation/  # Input validation
│   ├── utils/           # Utility functions
│   │   ├── errors.ts    # Custom error classes
│   │   └── test-helpers.ts
│   ├── types/           # TypeScript type definitions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Production seed
│   └── seed-test.ts     # Test data seed
├── __tests__/
│   ├── integration/     # Integration tests
│   └── setup.ts         # Test setup
├── docs/                # Documentation
│   ├── API_ENDPOINTS.md # Complete API reference
│   └── DEPLOYMENT.md    # Deployment guide
├── jest.config.js       # Jest configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

---

## 🔌 API Endpoints

### Base URL: `/api/v1`

| Module | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | `/auth/*` | Authentication & registration |
| **Users** | `/users/*` | User profile management |
| **Products** | `/products/*` | Product catalog |
| **Cart** | `/cart/*` | Shopping cart |
| **Orders** | `/orders/*` | Order management |
| **Analysis** | `/analysis/*` | Skin analysis |
| **Try-On** | `/tryon/*` | Virtual try-on |
| **Favorites** | `/favorites/*` or `/wishlist/*` | Saved products |
| **Notifications** | `/notifications/*` | User notifications |
| **Promotions** | `/promotions/*` | Discount codes |
| **Referrals** | `/referrals/*` | Referral system |
| **Fitness** | `/fitness/*` | Activity tracking & goals |
| **Guides** | `/guides/*` | Educational content |
| **Upload** | `/upload` | File uploads |
| **PerfectCorp** | `/perfectcorp/*` | AI/AR integration |

📖 **Complete API Documentation**: See [API_ENDPOINTS.md](./docs/API_ENDPOINTS.md)

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Coverage

- **E-Commerce**: Products, cart, orders (18 tests)
- **Guides**: Discovery, engagement (15 tests)
- **Fitness**: Activities, stats, goals (12 tests)
- **Promotions**: Validation, referrals (8 tests)
- **Notifications**: Management (6 tests)

**Total: 59+ integration tests**

---

## 🔐 Authentication

All protected endpoints require a Bearer token:

```http
Authorization: Bearer <access_token>
```

### Get Access Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "demo@glowverse.com",
  "password": "Demo@123"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "demo@glowverse.com",
    "name": "Demo User"
  }
}
```

---

## 📝 Sample Data

After running `npm run prisma:seed`:

### Test Accounts
```
Admin: admin@glowverse.com / Admin@123
Demo:  demo@glowverse.com / Demo@123
```

### Promotion Codes
```
WELCOME15 - 15% off first order
GLOW25    - 25% off orders $75+
FLAT10    - $10 flat discount
```

### Products
- 23 products across 4 categories
- Skincare: 8 products
- Makeup: 7 products
- Haircare: 5 products
- Fragrance: 3 products

---

## 🚀 Deployment

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Render

1. Connect GitHub repository
2. Set build command: `npm install && npx prisma generate && npm run build`
3. Set start command: `npx prisma migrate deploy && npm start`
4. Add environment variables
5. Deploy

📖 **Complete Deployment Guide**: See [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting (100 req/15min)
- ✅ CORS configured
- ✅ Helmet security headers
- ✅ Input validation
- ✅ SQL injection protection (Prisma)
- ✅ XSS prevention

---

## 📈 Performance

- ✅ Database indexing
- ✅ Query optimization
- ✅ Pagination on all list endpoints
- ✅ Compression middleware
- ✅ Response caching (where applicable)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@glowverse.com
- Documentation: See `/docs` directory

---

## 🗺️ Roadmap

- [ ] Stripe payment integration
- [ ] Email notifications
- [ ] Admin dashboard API
- [ ] Analytics endpoints
- [ ] WebSocket for real-time features
- [ ] GraphQL API
- [ ] Rate limiting per user
- [ ] API versioning (v2)

---

**Built with ❤️ for the Glowverse beauty community**
