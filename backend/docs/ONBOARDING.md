# Developer Onboarding Guide

Welcome to the Glowverse Backend team! This guide will get you from zero to code contribution in less than 2 hours.

## 1. Project Overview
Glowverse is a beauty-tech platform combining E-Commerce with AR Try-On experiences.
**Stack:** Node.js (Express), TypeScript, PostgreSQL (Prisma), Redis, Docker.

## 2. Prerequisites
- **Node.js:** v20 (LTS) - Use `nvm`.
- **Docker:** Desktop for Windows/Mac or Engine for Linux.
- **Git:** SCM.
- **VS Code:** Recommended IDE (Extensions: ESLint, Prettier, Prisma).

## 3. Local Setup

### Step 1: Clone
```bash
git clone https://github.com/calmcode47/Glowverse-app.git
cd Glowverse-app/backend
```

### Step 2: Environment
Copy the example env file:
```bash
cp .env.example .env
```
*Note: Ask the Tech Lead for key values (Cloudinary, Perfect Corp).*

### Step 3: Install
```bash
npm install
```

### Step 4: Database (Docker)
Start the database key services:
```bash
docker-compose up -d postgres redis
```

### Step 5: Migrations & Seed
Apply schema and populate dummy data:
```bash
npm run db:setup
```

### Step 6: Run
Start the development server with hot-reload:
```bash
npm run dev
```
Server is running at `http://localhost:5000`.

## 4. Development Workflow

1.  **Branching:** create feature branches from `main`.
    - Format: `feature/ticket-123-short-desc` or `fix/ticket-123`.
2.  **Commits:** Use conventional commits.
    - `feat: add user login`
    - `fix: resolve crash in cart`
3.  **Tests:** Run tests before pushing.
    - `npm test` runs all suites.
4.  **PRs:** Open a Pull Request against `main`. CI must pass.

## 5. Directory Structure
- `src/controllers`: Request handlers.
- `src/services`: Business logic (Fat Service, Skinny Controller).
- `src/routes`: API route definitions.
- `src/models`: Prisma schema (`prisma/schema.prisma`).

## 6. How-To Guides

### How to add a new Endpoint
1.  Define route in `src/routes/v1/resource.route.ts`.
2.  Create controller method in `src/controllers/resource.controller.ts`.
3.  Implement logic in `src/services/resource.service.ts`.
4.  Add validation middleware.
5.  Add Integration Test in `__tests__/integration`.

### How to Debug
- Use `console.debug()` or VS Code Debugger (Attach to process).
- Check logs in `logs/app.log`.
