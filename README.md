# Boiler API

A Node.js TypeScript API with microservices architecture, built with Express.js, Prisma, MySQL, and Redis.

## 🚀 Features

- **Microservices Architecture**: Organized by services with clear separation of concerns
- **Type Safety**: Full TypeScript support with strict type checking
- **Database**: MySQL with Prisma ORM, connection pooling, and migrations
- **Caching**: Redis for high-performance data caching
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Testing**: Jest with comprehensive test coverage
- **Logging**: Structured logging with Winston
- **Error Handling**: Centralized error handling with custom error classes
- **Validation**: Zod for environment variables and request validation
- **Docker**: Multi-stage builds with development and production environments

## 🏗️ Architecture

```
src/
├── config/          # Configuration files (database, redis, logger, env)
├── middleware/      # Express middleware (security, validation, error handling)
├── routes/          # API route definitions
├── types/           # TypeScript type definitions and custom errors
├── utils/           # Utility functions and helpers
└── tests/           # Test setup and utilities

services/
├── user-service/    # User management service
│   ├── src/
│   │   ├── controller/  # HTTP request handlers
│   │   ├── service/     # Business logic
│   │   ├── repository/  # Data access layer
│   │   ├── validation/  # Request validation schemas
│   │   ├── types/       # Service-specific types
│   │   └── routes/      # Service routes
│   └── tests/           # Service-specific tests

libs/                # Shared libraries (future)
prisma/              # Database schema and migrations
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL with Prisma ORM
- **Cache**: Redis
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Logging**: Winston
- **Security**: Helmet, CORS, bcrypt
- **Code Quality**: ESLint, Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- MySQL 8.0 or higher
- Redis 7.0 or higher
- Yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd boiler
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and provide required values:
   - `DATABASE_URL`: MySQL connection string
   - `JWT_SECRET`: Minimum 32 characters for JWT signing

4. **Set up database**
   ```bash
   # Generate Prisma client
   yarn run db:generate
   
   # Run migrations
   yarn run db:migrate
   
   # Seed database with initial data
   yarn run db:seed
   ```

5. **Start development server**
   ```bash
   yarn run dev
   ```

   The API will be available at `http://localhost:3000`

### Using Docker

For development with Docker:

```bash
# Start services (MySQL, Redis)
docker-compose -f docker-compose.dev.yml up -d

# Run the application
yarn run dev
```

For production:

```bash
# Build and start all services
docker-compose up --build
```

## 📚 API Documentation

### Health Check

```bash
GET /api/v1/health
```

### User Management

```bash
# Get all users (with pagination and search)
GET /api/v1/users?page=1&limit=10&q=search&sort_by=created_at&sort_order=desc

# Get user by ID
GET /api/v1/users/:id

# Create new user
POST /api/v1/users
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "Password123!"
}

# Update user
PUT /api/v1/users/:id
{
  "first_name": "Jane",
  "email": "jane@example.com"
}

# Activate user
PATCH /api/v1/users/:id/activate

# Deactivate user
PATCH /api/v1/users/:id/deactivate

# Delete user (soft delete by default)
DELETE /api/v1/users/:id

# Permanent delete
DELETE /api/v1/users/:id?permanent=true

# Search users
GET /api/v1/users/search?q=john&page=1&limit=10
```

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn run test:watch

# Run tests with coverage
yarn test -- --coverage
```

## 🔧 Development

### Code Quality

```bash
# Lint code
yarn run lint

# Fix lint issues
yarn run lint:fix

# Format code
yarn run prettier
```

### Database Operations

```bash
# Generate Prisma client
yarn run db:generate

# Create and run migration
yarn run db:migrate

# Push schema changes (development)
yarn run db:push

# Open Prisma Studio
yarn run db:studio

# Seed database
yarn run db:seed

# Reset database
yarn run db:reset
```

### Security Audit

```bash
# Check for vulnerabilities
yarn audit

# Fix vulnerabilities
yarn run audit:fix
```

## 🚀 Production Deployment

1. **Build the application**
   ```bash
   yarn run build
   ```

2. **Set production environment variables**
   - Set `NODE_ENV=production`
   - Use secure values for all secrets
   - Configure proper database and Redis URLs

3. **Run migrations**
   ```bash
   yarn run db:migrate
   ```

4. **Start the application**
   ```bash
   yarn start
   ```

## 📁 Project Structure Details

### Core Architecture Principles

- **KISS**: Keep It Simple, Stupid - Choose straightforward solutions
- **YAGNI**: You Aren't Gonna Need It - Implement features only when needed
- **Single Responsibility**: Each component has one clear purpose
- **Dependency Inversion**: Depend on abstractions, not concretions

### File Limits

- **Files**: Maximum 500 lines of code
- **Functions**: Maximum 50 lines
- **Classes**: Maximum 100 lines
- **Line length**: Maximum 100 characters

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.