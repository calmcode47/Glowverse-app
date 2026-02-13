# Coding Standards

## 1. General Principles
- **DRY (Don't Repeat Yourself):** Extract common logic into helpers or services.
- **SOLID:** Adhere to SOLID principles, especially Single Responsibility.
- **Explicit is better than implicit:** Type everything.

## 2. TypeScript
- **No `any`:** Avoid `any` at all costs. Use `unknown` or specific interfaces.
- **Interfaces vs Types:** Use `interface` for object definitions (expandable) and `type` for unions/blocks.
- **Async/Await:** Prefer `async/await` over raw Promises.

## 3. Naming Conventions
- **Variables/Functions:** `camelCase` (e.g., `getUser`, `isValid`).
- **Classes/Interfaces:** `PascalCase` (e.g., `UserService`, `IUser`).
- **Files:** `kebab-case` (e.g., `user.service.ts`).
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).

## 4. Error Handling
- **Exceptions:** Throw `AppError` (custom class) for business logic failures.
- **Catching:** Middleware handles top-level errors. Do not suppress errors with empty catches.
- **HTTP Codes:** Use correct status codes (400 vs 401 vs 403).

## 5. Logging
- **Levels:**
    - `error`: System breaks, human intervention needed.
    - `warn`: Something unexpected but handled.
    - `info`: Key lifecycle events (Startup, connected).
    - `debug`: Detailed dev info (Payloads).
- **Secrets:** NEVER log passwords, tokens, or PII.

## 6. Testing
- **Unit:** Test logic in isolation (mock dependencies).
- **Integration:** Test API endpoints with database.
- **Coverage:** Aim for >70% branch coverage.
