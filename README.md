# Backend Template

> 🚀 **Enterprise-grade NestJS backend starter template** with MongoDB, Prisma ORM, JWT authentication, Redis caching, Bull queues, and comprehensive security features.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Database**: MongoDB with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT (Access & Refresh tokens)
- **API Documentation**: Swagger/OpenAPI
- **Task Scheduling**: Bull Queue with Redis
- **Storage**: Cloudinary for media management
- **Validation**: Zod schema validation
- **Rate Limiting**: Throttler for API protection
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+
- pnpm
- MongoDB instance
- Redis instance
- Cloudinary account (optional, for media management)

## Quick Start

### 🎯 Setting Up a New Project (Recommended)

When cloning this template to start a new project, use the automated setup script:

```bash
# Clone the template
git clone <template-repo-url> my-new-project
cd my-new-project

# Run the setup script (choose one based on your platform)

# Node.js (Recommended - works on all platforms)
node scripts/setup-new-project.mjs

# Bash (Linux/macOS)
chmod +x scripts/setup-new-project.sh
./scripts/setup-new-project.sh

# PowerShell (Windows)
.\scripts\setup-new-project.ps1
```

The setup script will:

- ✅ Prompt for project details (name, description, author, etc.)
- ✅ Update package.json, README.md, and configuration files
- ✅ Create .env file with sensible defaults
- ✅ Clean up template-specific files and logs
- ✅ Initialize a fresh git repository
- ✅ Install dependencies and generate Prisma client
- ✅ Remove itself after completion

**📚 For detailed setup options and troubleshooting, see [scripts/README.md](scripts/README.md)**

### 📦 Manual Installation (Alternative)

If you prefer manual setup:

#### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repo-url>
cd <project-name>

# Install dependencies
pnpm install
```

#### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update `.env` with your actual credentials. **Important:** Generate secure JWT secrets:

```bash
# Generate secure random strings for JWT secrets
openssl rand -base64 32
```

#### 3. Database Setup

```bash
# Generate Prisma Client
pnpm run prisma:generate

# Set up database and seed
pnpm run prisma:db:reset
```

## Running the Application

### Development

```bash
# Start in watch mode
pnpm start:dev

# Start with debugging
pnpm start:debug
```

### Production

```bash
# Build
pnpm run build

# Run built application
pnpm start:prod

# Using PM2
pnpm run prod
```

## Project Structure

```
src/
├── config/              # Configuration management
├── constants/           # Global constants and error messages
├── filters/             # Exception filters
├── helpers/             # Utility helpers
├── interceptors/        # Response interceptors
├── lib/                 # External service integrations (Cloudinary, Redis)
├── middlewares/         # NestJS middlewares
├── modules/             # Feature modules
│   ├── admin/          # Admin management
│   └── auth/           # Authentication
├── pipes/              # NestJS pipes i.e validation
├── shared/             # Shared utilities
│   ├── auth/           # Auth guards and decorators
│   ├── config/         # Shared configs
│   ├── emails/         # Email service
│   ├── logger/         # Logging service
│   └── prisma/         # Prisma service
└── utils/              # Utility functions
```

## Key Features

### Notifications

- Firebase Cloud Messaging powers push + in-app notifications.
- Configure the following environment variables with your service account: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and optionally override `FIREBASE_NOTIFICATIONS_RETENTION_DAYS` (defaults to 90 days).
- Device tokens are registered via the API and messages are queued through Bull for reliable delivery.

### Authentication & Authorization

- JWT-based authentication for admins and users
- Role-based access control (Admin, Moderator, Employer, Applicant)
- Secure password hashing with bcryptjs

### Admin Management

- Admin user CRUD operations
- Profile and password management
- Role-based permissions

### Database

- MongoDB database with Prisma ORM
- Type-safe database operations
- Automated migrations

### API Documentation

- Swagger/OpenAPI integration
- Auto-generated API documentation at `/swagger`

### Error Handling

- Global exception filters
- Zod-based validation errors
- Structured error responses

### Logging

- Request/response logging middleware
- Structured logging service

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:cov

# Run E2E tests
pnpm test:e2e
```

## Linting & Formatting

```bash
# Lint and fix code
pnpm lint

# Format code
pnpm format
```

## Commit Message Convention

This project uses commitlint. Follow the conventional commit format:

```
type(scope): subject

body
footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
