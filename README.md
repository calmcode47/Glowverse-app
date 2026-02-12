# Glowverse - AI/AR Beauty & Grooming Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-black.svg)](https://expo.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

**An immersive AI- and AR-powered beauty platform combining virtual try-on, skin analysis, personalized recommendations, e-commerce, and wellness tracking to help users discover products, visualize results in real-time, and make confident purchase decisions.**

---

## 📊 Project Status

| Component | Status | Completion | Notes |
|-----------|--------|------------|-------|
| **Backend API** | ✅ Complete | 95% | 60+ endpoints, full testing suite |
| **Database** | ✅ Complete | 100% | 25+ models, seeded data |
| **Frontend UI** | ⚠️ In Progress | 25% | 76+ components, 30 screens scaffolded |
| **Testing** | ⚠️ Partial | 30% | Backend tests created, not yet run |
| **Documentation** | ✅ Complete | 95% | API docs, deployment guides |

---

## 🏗️ Repository Structure

```
Glowverse-app/
├── backend/          # Node.js + Express + TypeScript API
│   ├── src/          # Source code
│   ├── prisma/       # Database schema & migrations
│   ├── __tests__/    # Integration tests
│   └── docs/         # API documentation
├── frontend/         # React Native + Expo mobile app
│   ├── src/          # Source code
│   ├── __tests__/    # Component tests
│   └── assets/       # Images, fonts, icons
├── docker-compose.yml
├── render.yaml       # Render deployment config
└── railway.json      # Railway deployment config
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **PostgreSQL** (for production) or **Docker** (recommended)
- **Expo CLI** (for mobile development)

### 1. Clone Repository
```bash
git clone <repository-url>
cd Glowverse-app
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database (Docker recommended)
docker-compose up -d postgres

# Initialize database
npm run db:setup

# Start development server
npm run dev
```

**Backend will be running at:** `http://localhost:5000`  
**Health check:** `http://localhost:5000/health`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Expo development server
npm start

# Or run on specific platform
npm run web      # Web browser
npm run ios      # iOS simulator (macOS only)
npm run android  # Android emulator
```

**Frontend will be running at:** `http://localhost:8081`

---

## 🌟 Key Features

### Backend Features

#### 🔐 Authentication & User Management
- JWT-based authentication with refresh tokens
- User registration, login, password management
- Profile management with avatar uploads
- User preferences and settings

#### 🛒 E-Commerce System
- **Product Catalog:** 50+ products across 10 categories
- **Shopping Cart:** Full cart management with persistence
- **Order Processing:** Complete order lifecycle management
- **Favorites/Wishlist:** Save products for later
- **Product Recommendations:** AI-powered suggestions

#### 📢 Notifications & Engagement
- Real-time push notifications
- In-app notification center
- Order status updates
- Promotional alerts

#### 🎁 Promotions & Loyalty
- Discount code system (percentage & fixed amount)
- Referral program with rewards
- First-order promotions
- Seasonal campaigns

#### 💪 Fitness & Wellness
- Activity logging (cardio, strength, yoga, etc.)
- Goal setting and tracking
- Progress statistics and analytics
- Workout history

#### 📚 Beauty Guides CMS
- Step-by-step tutorials
- User engagement (likes, bookmarks, comments)
- Featured and trending content
- Category-based organization

#### 🔍 Global Search
- Cross-entity search (products + guides)
- Search suggestions
- Popular searches tracking

#### 🎨 AR/AI Integration
- PerfectCorp API integration
- Skin analysis
- Virtual try-on
- Product recommendations

### Frontend Features

#### 🎨 Premium UI/UX
- **76+ Reusable Components:** Buttons, cards, animations
- **30 Screens:** Authentication, shopping, AR, profile, fitness
- **Advanced Animations:** Parallax, scroll reveals, transitions
- **Modern Design:** Glassmorphism, gradients, premium aesthetics

#### 📱 Mobile Experience
- React Native for cross-platform (iOS & Android)
- Expo for rapid development and deployment
- React Navigation for seamless routing
- React Native Paper for Material Design

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js 18+** | Runtime environment |
| **TypeScript 5.3** | Type-safe JavaScript |
| **Express 4.18** | Web framework |
| **Prisma 5.7** | ORM and database toolkit |
| **PostgreSQL** | Production database |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Jest + Supertest** | Testing framework |
| **Cloudinary** | Image hosting |
| **Winston** | Logging |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React Native 0.81** | Mobile framework |
| **Expo SDK 54** | Development platform |
| **TypeScript 5.9** | Type safety |
| **React Navigation 7** | Routing |
| **React Native Paper 5** | UI components |
| **Axios** | HTTP client |
| **React Native Reanimated** | Animations |

---

## 📚 Documentation

### Backend Documentation
- **[API Documentation](backend/docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Deployment Guide](backend/docs/DEPLOYMENT.md)** - Production deployment
- **[Docker Setup](backend/docs/DOCKER_SETUP.md)** - Containerization guide
- **[Backend README](backend/README.md)** - Detailed backend docs

### Frontend Documentation
- **[Frontend README](frontend/README.md)** - Mobile app documentation
- **Component Library** - UI component reference (in progress)

### Project Reports
- **[Comprehensive Status Report](docs/comprehensive_status_report.md)** - Full project analysis
- **[Build Error Fixes](docs/build_error_fixes.md)** - Troubleshooting guide

---

## 🔌 API Overview

**Base URL:** `http://localhost:5000/api/v1`

### Main Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | `/auth/*` | Registration, login, token refresh |
| **Users** | `/users/*` | Profile management |
| **Products** | `/products/*` | Product catalog |
| **Cart** | `/cart/*` | Shopping cart |
| **Orders** | `/orders/*` | Order management |
| **Notifications** | `/notifications/*` | User notifications |
| **Promotions** | `/promotions/*` | Discount codes |
| **Referrals** | `/referrals/*` | Referral system |
| **Fitness** | `/fitness/*` | Activity & goal tracking |
| **Guides** | `/guides/*` | Beauty tutorials |
| **Search** | `/search/*` | Global search |
| **Upload** | `/upload` | File uploads |

**Total:** 60+ RESTful endpoints

📖 **Complete API Documentation:** [backend/docs/API_DOCUMENTATION.md](backend/docs/API_DOCUMENTATION.md)

---

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration
```

**Test Suites:**
- ✅ E-Commerce (products, cart, orders)
- ✅ Notifications (CRUD operations)
- ✅ Promotions (validation)
- ✅ Fitness (activities, goals)
- ✅ Guides (content, engagement)

**Status:** Tests created but not yet executed (requires database setup)

### Frontend Tests
```bash
cd frontend

# Run tests
npm test
```

**Status:** Test infrastructure ready, tests to be written

---

## 🗄️ Database

### Schema Overview
- **25+ Models** covering all features
- **11 Enums** for type safety
- **Complex Relationships** (one-to-many, many-to-many)
- **Optimized Indexes** for performance

### Key Models
- **User Management:** User, UserProfile, UserPreferences
- **E-Commerce:** Product, Cart, Order, Favorite
- **Content:** Guide, GuideStep, GuideComment
- **Fitness:** FitnessActivity, FitnessGoal
- **Promotions:** Promotion, ReferralCode

### Database Commands
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio

# Complete setup (all-in-one)
npm run db:setup
```

---

## 🚀 Deployment

### Docker Deployment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Railway Deployment
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Render Deployment
1. Connect GitHub repository
2. Configure build command: `npm install && npx prisma generate && npm run build`
3. Configure start command: `npx prisma migrate deploy && npm start`
4. Add environment variables
5. Deploy

📖 **Detailed Deployment Guide:** [backend/docs/DEPLOYMENT.md](backend/docs/DEPLOYMENT.md)

---

## 🔐 Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/glowverse

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8081

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# PerfectCorp (optional)
PERFECTCORP_API_KEY=your-api-key
PERFECTCORP_API_SECRET=your-api-secret

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Frontend
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
EXPO_PUBLIC_PERFECTCORP_API_KEY=your-api-key
```

---

## 📦 Sample Data

After running `npm run db:setup`, the database includes:

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
- **50+ Products** across 10 categories
- Skincare, Makeup, Haircare, Bodycare, Fragrance, etc.

### Guides
- **15-20 Beauty Guides** with step-by-step instructions
- Categories: Skincare, Makeup, Haircare, Wellness

---

## 🔒 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Rate limiting (100 req/15min globally)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation with express-validator
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS prevention
- ✅ File upload validation

---

## 📈 Performance

- ✅ Database indexing on common queries
- ✅ Query optimization with Prisma
- ✅ Pagination on all list endpoints
- ✅ Compression middleware
- ✅ Image optimization with Sharp
- ⚠️ Redis caching (configured, not yet utilized)

---

## 🗺️ Roadmap

### Backend (Short-term)
- [ ] Execute and verify all tests
- [ ] Implement Redis caching
- [ ] Set up monitoring (Sentry)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Performance optimization

### Frontend (Short-term)
- [ ] API integration layer
- [ ] State management (Redux Toolkit)
- [ ] Screen implementations
- [ ] Form validation
- [ ] Component testing

### Future Features
- [ ] Stripe payment integration
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics endpoints
- [ ] WebSocket for real-time features
- [ ] GraphQL API
- [ ] Social features (sharing, following)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 🆘 Support

For issues and questions:
- **GitHub Issues:** Create an issue
- **Email:** support@glowverse.com
- **Documentation:** See `/docs` directory

---

## 📄 License

This project is proprietary software developed for the Glowverse beauty platform.

---

## 🙏 Acknowledgments

- **PerfectCorp** - AI/AR technology partner
- **Expo Team** - Mobile development platform
- **Prisma Team** - Database toolkit
- **React Native Community** - Mobile framework

---

**Built with ❤️ for the Glowverse beauty community**

*Last Updated: February 12, 2026*
