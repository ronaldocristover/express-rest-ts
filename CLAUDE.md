# CLAUDE.md

This file provides comprehensive guidance to Claude Code when working with Typescript code in this repository.

## Core Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible. Simple solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)

Avoid building functionality on speculation. Implement features only when they are needed, not when you anticipate they might be useful in the future.

### Design Principles

- **Dependency Inversion**: High-level modules should not depend on low-level modules. Both should depend on abstractions.
- **Open/Closed Principle**: Software entities should be open for extension but closed for modification.
- **Single Responsibility**: Each function, class, and module should have one clear purpose.
- **Fail Fast**: Check for potential errors early and raise exceptions immediately when issues occur.

## 🧱 Code Structure & Modularity

### File and Function Limits

- **Never create a file longer than 500 lines of code**. If approaching this limit, refactor by splitting into modules.
- **Functions should be under 50 lines** with a single, clear responsibility.
- **Classes should be under 100 lines** and represent a single concept or entity.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Line lenght should be max 100 characters** ruff rule in pyproject.toml
- **Use venv_linux** (the virtual environment) whenever executing Typescript commands, including for unit tests.

### Project Architecture

Follow strict vertical slice architecture with tests living next to the code they test:

```
src/
│── package.json             # root workspace config (yarn workspaces)
│── tsconfig.json            # base TS config
│── jest.config.js           # base jest config
│── .eslintrc.js             # base eslint config
│── .prettierrc              # prettier config
│── docker-compose.yml
│── .env
│── .env-example
├── prisma/
│   ├── types/
│   └── schema.prisma
├── services/
│   ├── user-service/
│   │   ├── src/
│   │   │   ├── route/
│   │   │   ├── controller/
│   │   │   ├── services/
│   │   │   ├── repository/
│   │   │   └── index.ts
│   │   ├── tests/           # unit/integration tests
│   │   │   └── user.spec.ts
│   ├── order-service/
│   │   └── ...
│   └── payment-service/
│       └── ...
├── libs/
│   ├── logger/
│   │   ├── src/
│   │   ├── tests/
│   │   └── package.json
│   ├── utils/
│   ├── event-bus/
│   ├── http-client/
│   ├── config/
│   │   └── env.ts
│   └── types/
```

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript
- **Package Manager:** yarn
- **Database:** MySQL with Prisma ORM
- **Caching:** Redis for data caching and session storage (Used in Repository)
- **Validation:** Zod for environment variables and input validation
- **Logging:** Winston (connected to Grafana)
- **Testing:** Jest with Supertest
- **Containerization:** Docker & Docker Compose
- **Code Quality:** ESLint, Prettier

## Environment Variables

**Critical:** Environment validation and database connectivity testing occur at startup using Zod schemas and Prisma connection tests. The server will not start if required variables are missing/invalid or if database connection fails.

### Required Variables:

- `DATABASE_URL`: MySQL connection string (format: mysql://username:password@host:port/database)
- `JWT_SECRET`: Must be at least 32 characters

### Optional Variables (with defaults):

- `NODE_ENV`: development | production | test (default: development)
- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: localhost)
- `JWT_EXPIRES_IN`: Token expiration (default: 7d)
- `LOG_LEVEL`: error|warn|info|debug (default: info)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window (default: 900000)
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window (default: 100)
- `CORS_ORIGIN`: Allowed origins (default: http://localhost:3000)
- `API_VERSION`: API version prefix (default: v1)
- `REDIS_URL`: Redis connection string (default: redis://localhost:6379)
- `REDIS_HOST`: Redis host (default: localhost)
- `REDIS_PORT`: Redis port (default: 6379)
- `REDIS_PASSWORD`: Redis password (optional)
- `REDIS_DB`: Redis database number (default: 0)
- `REDIS_CONNECT_TIMEOUT`: Redis connection timeout in ms (default: 5000)

## Common Commands

```bash
# Setup
yarn install
cp .env.example .env  # Configure required variables (REQUIRED BEFORE STARTING)

# Development
yarn run dev           # Start with hot reload
yarn run build         # Build TypeScript
yarn start            # Start production server

# Database
yarn run db:generate  # Generate Prisma client
yarn run db:migrate   # Run migrations
yarn run db:push      # Push schema to database
yarn run db:studio    # Open Prisma Studio
yarn run db:seed      # Seed database with initial data
yarn run db:reset     # Reset database and run seed

# Quality & Testing
yarn run lint         # Check code style
yarn run lint:fix     # Fix code style issues
yarn run prettier     # Format code
yarn test            # Run tests
yarn run test:watch  # Run tests in watch mode
yarn audit           # Check for security vulnerabilities
yarn audit fix       # Fix security vulnerabilities

# Docker
docker-compose up                    # Production environment
docker-compose -f docker-compose.dev.yml up  # Development environment
```

## API Endpoints

### Rest API FOrmat

- **GET** `/api/v1/service-a` - List users with pagination and search
  - Query params:
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 10)
    - `sort_by` - Sort field (default: createdAt)
    - `sort_order` - Sort direction: asc | desc (default: desc)
    - `q` - Search query (searches firstName, lastName, email with case-insensitive matching)
- **GET** `/api/v1/service-a/:id` - Get user by ID
- **POST** `/api/v1/service-a` - Create new user
- **PUT** `/api/v1/service-a/:id` - Update user
- **DELETE** `/api/v1/service-a/:id` - Delete user (soft delete by default)

---

## 🔄 Flow Example

    HTTP Request → Routes -> Middleware -> Controller → Service → Repository → Prisma → MySQL

Example: 1. `POST /users` → `user.controller.ts`\
2. Calls `CreateUserService`\
3. Uses `IUserRepository` → implemented by `UserRepositoryPrisma`\
4. Calls Prisma → saves user in MySQL

---

### Naming Conventions

- **Variables and functions**: `PascalCase`,
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Type aliases**: `PascalCase`
- **Enum values**: `UPPER_SNAKE_CASE`

## 🧪 Testing Strategy

### Test-Driven Development (TDD)

1. **Write the test first** - Define expected behavior before implementation
2. **Watch it fail** - Ensure the test actually tests something
3. **Write minimal code** - Just enough to make the test pass
4. **Refactor** - Improve code while keeping tests green
5. **Repeat** - One test at a time

---

### Test Organization

- Unit tests: Test individual functions/methods in isolation
- Integration tests: Test component interactions
- End-to-end tests: Test complete user workflows
- Keep test files next to the code they test

---

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test additions or fixes- Aim for 80%+ code coverage, but focus on critical paths

## Implemented Features

### Middleware Stack

- **Security**: Helmet, CORS, rate limiting
- **Request Processing**: Body parsing, compression
- **Logging**: Winston with structured logging
- **Validation**: Zod with custom middleware for type-safe validation
- **Error Handling**: Centralized error handling with custom error classes

### Validation & Error Handling

- Environment validation using Zod schemas
- Input validation using Zod schemas with custom middleware
- Type-safe request validation with automatic data transformation
- Custom error classes with HTTP status codes
- Centralized error handling middleware
- Async error handling wrapper

### Database Layer

- Prisma ORM with MySQL
- Repository pattern for data access
- Connection pooling and query logging
- Migration support
- Environment-specific database seeding
- Password hashing with bcrypt (12 salt rounds)
- Idempotent seed operations (safe to run multiple times)
- Advanced search functionality with case-insensitive matching across multiple fields

### Testing Setup

- Jest configuration with TypeScript support
- Supertest for API testing
- Database cleanup between tests
- Path mapping for imports

### Development Tools

- Hot reload with tsx
- TypeScript path mapping
- ESLint with TypeScript support
- Prettier for code formatting
- Docker multi-stage builds

## Development Guidelines

### Architecture Patterns

- **Layered Architecture:** Controllers → Services → Repositories → Database
- **RESTful API Design:** Follow REST principles with consistent endpoint naming
- **Error Handling:** Use custom error classes and centralized error handling
- **Async Operations:** Use async/await with proper error handling wrappers

### Code Organization

- Place HTTP logic in controllers
- Keep business logic in services
- Handle data operations in repositories
- Handle data caching with redis in repositories
- Use middleware to validate Authentication, Authorization
- Put Input Request Validation in Controller, return 400 and show errors in response content.
- Define TypeScript interfaces in models directory
- Implement validation in dedicated validators

### File Naming Conventions

- **Service files**: Use `module.service.ts` format (e.g., `user.service.ts`)
- **Repository files**: Use `module.repository.ts` format (e.g., `user.repository.ts`)
- **Controller files**: Use `module.controller.ts` format (e.g., `user.controller.ts`)
- **Route files**: Use `module.route.ts` format (e.g., `user.route.ts`)
- **All module files**: Use lowercase naming for consistency and cross-platform compatibility
- **Prisma Schema** use snake_case for object name instead using mapping

### Security Best Practices

- Environment variable validation at startup
- Input validation on all endpoints
- Rate limiting with different tiers (general, API, strict)
- Security headers with Helmet
- CORS configuration
- SQL injection prevention through Prisma

### Testing Strategy

- Unit tests for services and utilities
- Integration tests for API endpoints
- Database cleanup between tests
- Test environment isolation

### Database Management

- Use Prisma for all database operations
- Define models in `prisma/schema.prisma`
- Run migrations for schema changes
- Use repository pattern for data access abstraction
- Implement soft deletes where appropriate
- Use environment-specific seeding for different deployment stages
- Seed database with `yarn run db:seed` (idempotent operation)
- Reset and seed with `yarn run db:reset` for clean state

### Redis Caching

- **Configuration**: Centralized Redis configuration in `src/config/redis.ts`
- **Connection Management**: Singleton pattern with automatic connection handling
- **Health Checks**: Built-in Redis health check functionality
- **Caching Strategy**: Cache-aside pattern implemented in repositories
- **Cache Keys**: Structured naming convention (e.g., `user:{id}`, `user:email:{email}`)
- **TTL Management**: Configurable cache expiration (default: 1 hour)
- **Error Handling**: Graceful fallback to database if Redis is unavailable
- **Cache Invalidation**: Automatic cache invalidation on data updates/deletes

#### Redis Usage in Repositories

The user repository demonstrates Redis caching implementation:

- **Read Operations**: Check cache first, fallback to database, then cache the result
- **Write Operations**: Update database first, then update/invalidate cache
- **Delete Operations**: Remove from database first, then invalidate cache
- **Dual Caching**: Cache by both ID and email for efficient lookups

###
