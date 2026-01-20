# Quick Start Guide

This guide will help you quickly set up a new project from this NestJS backend starter template.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Setup Methods](#setup-methods)
- [Post-Setup Configuration](#post-setup-configuration)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher
- **pnpm** (Install: `npm install -g pnpm`)
- **Git**
- **MongoDB** (local or cloud instance)
- **Redis** (local or cloud instance)

---

## Setup Methods

### Method 1: Automated Setup (Recommended) ⚡

The fastest way to get started:

```bash
# 1. Clone the template
git clone <template-repo-url> my-awesome-project
cd my-awesome-project

# 2. Run setup script (creates a convenience alias)
pnpm setup

# Or run directly
node scripts/setup-new-project.mjs
```

**The script will:**

- ✅ Ask for your project details
- ✅ Update all configuration files
- ✅ Create `.env` with defaults
- ✅ Initialize fresh git repository
- ✅ Install all dependencies
- ✅ Generate Prisma client
- ✅ Clean up and remove itself

**Time:** ~5-10 minutes (including dependency installation)

### Method 2: Platform-Specific Scripts

#### Linux/macOS (Bash)

```bash
chmod +x scripts/setup-new-project.sh
./scripts/setup-new-project.sh
```

#### Windows (PowerShell)

```powershell
# Enable script execution (one-time, as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run setup
.\scripts\setup-new-project.ps1
```

### Method 3: Manual Setup

If you prefer full control:

1. **Clone and install:**

   ```bash
   git clone <template-repo-url> my-project
   cd my-project
   pnpm install
   ```

2. **Configure:**
   - Edit `package.json` (name, description, author)
   - Edit `README.md` with your project info
   - Copy `.env.example` to `.env` and fill in values

3. **Clean up:**

   ```bash
   rm -rf logs/*
   rm -rf .git
   git init
   git add .
   git commit -m "Initial commit"
   ```

4. **Setup database:**
   ```bash
   pnpm run prisma:generate
   pnpm run prisma:db:reset
   ```

---

## Post-Setup Configuration

### 1. Environment Variables

Edit your `.env` file with actual credentials:

```bash
# Generate secure JWT secrets
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for JWT_REFRESH_SECRET
```

**Critical variables to update:**

| Variable             | Description               | Example                          |
| -------------------- | ------------------------- | -------------------------------- |
| `DATABASE_URL`       | MongoDB connection string | `mongodb://localhost:27017/mydb` |
| `JWT_SECRET`         | Access token secret       | Generated secure string          |
| `JWT_REFRESH_SECRET` | Refresh token secret      | Generated secure string          |
| `REDIS_HOST`         | Redis server host         | `localhost` or cloud URL         |
| `REDIS_PORT`         | Redis server port         | `6379`                           |
| `MAIL_*`             | Email service credentials | From your provider               |
| `CLOUDINARY_*`       | Media storage credentials | From Cloudinary dashboard        |

### 2. Database Setup

```bash
# Push schema and seed database
pnpm run prisma:db:reset

# Or step by step:
pnpm run prisma:generate  # Generate Prisma client
pnpm run prisma:seed      # Seed database
```

### 3. Verify Installation

```bash
# Start development server
pnpm run start:dev

# Check API documentation
# Open: http://localhost:3000/api/docs
```

---

## Common Tasks

### Development

```bash
# Start in watch mode
pnpm run start:dev

# Start with debugging
pnpm run start:debug

# View Prisma data in GUI
pnpm run prisma:studio
```

### Database

```bash
# Generate Prisma client (after schema changes)
pnpm run prisma:generate

# Reset database (drop + recreate + seed)
pnpm run prisma:db:reset

# Seed database only
pnpm run prisma:seed
```

### Code Quality

```bash
# Format code
pnpm run format

# Lint and fix
pnpm run lint

# Run tests
pnpm run test

# Test with coverage
pnpm run test:cov

# E2E tests
pnpm run test:e2e
```

### Production

```bash
# Build application
pnpm run build

# Run production build
pnpm run start:prod

# Or use PM2
pnpm run prod
```

---

## Troubleshooting

### Setup Script Issues

**Problem:** `Cannot find module` error

```bash
# Solution: Ensure Node.js 18+ is installed
node --version  # Should be >= 18.0.0
```

**Problem:** Permission denied (Linux/macOS)

```bash
# Solution: Make script executable
chmod +x scripts/setup-new-project.sh
```

**Problem:** PowerShell execution policy (Windows)

```powershell
# Solution: Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Database Issues

**Problem:** `Cannot connect to MongoDB`

```bash
# Solution 1: Check if MongoDB is running
# macOS/Linux: sudo systemctl status mongodb
# Windows: Check Services panel

# Solution 2: Verify DATABASE_URL in .env
echo $DATABASE_URL

# Solution 3: Test connection
mongosh "mongodb://localhost:27017/your-db-name"
```

**Problem:** Prisma errors after schema changes

```bash
# Solution: Regenerate client
pnpm run prisma:generate

# If still failing, reset database
pnpm run prisma:db:reset
```

### Redis Issues

**Problem:** `Cannot connect to Redis`

```bash
# Solution 1: Check if Redis is running
redis-cli ping  # Should return "PONG"

# Solution 2: Verify REDIS_HOST and REDIS_PORT in .env

# Solution 3: Start Redis
# macOS: brew services start redis
# Linux: sudo systemctl start redis
# Windows: Download from GitHub releases
```

### Dependency Issues

**Problem:** `pnpm` not found

```bash
# Solution: Install pnpm globally
npm install -g pnpm
```

**Problem:** Installation fails

```bash
# Solution 1: Clear pnpm cache
pnpm store prune

# Solution 2: Remove and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Runtime Issues

**Problem:** Port 3000 already in use

```bash
# Solution: Change PORT in .env
PORT=3001

# Or find and kill the process using port 3000
# macOS/Linux: lsof -ti:3000 | xargs kill -9
# Windows: netstat -ano | findstr :3000
#          taskkill /PID <PID> /F
```

**Problem:** `JWT_SECRET` not set errors

```bash
# Solution: Ensure .env file exists and has all required variables
cp .env.example .env
# Then edit .env with your values
```

---

## Environment-Specific Setup

### Docker Setup (Coming Soon)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Cloud Deployment

#### MongoDB Atlas

1. Create cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Get connection string
3. Update `DATABASE_URL` in production environment

#### Redis Cloud

1. Create database at [redis.com/try-free](https://redis.com/try-free)
2. Get connection details
3. Update `REDIS_HOST` and `REDIS_PORT`

#### Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get credentials from dashboard
3. Update `CLOUDINARY_*` variables

---

## Next Steps

After successful setup:

1. **Explore the codebase:**
   - Check out the module structure in `src/modules/`
   - Review the authentication flow in `src/modules/auth/`
   - Understand the Prisma schema in `prisma/schema.prisma`

2. **Customize for your project:**
   - Add new modules: `nest g module modules/my-feature`
   - Update Prisma schema for your data model
   - Configure additional services in `src/config/`

3. **Review documentation:**
   - Main README: [../README.md](../README.md)
   - Setup Scripts: [../scripts/README.md](../scripts/README.md)
   - API Docs: http://localhost:3000/api/docs (when running)

4. **Security checklist:**
   - [ ] Generate unique JWT secrets
   - [ ] Update all default passwords
   - [ ] Configure CORS for your frontend
   - [ ] Review rate limiting settings
   - [ ] Enable HTTPS in production
   - [ ] Set up proper logging and monitoring

---

## Getting Help

- **Documentation:** Check the README files in each directory
- **API Docs:** http://localhost:3000/api/docs (when server is running)
- **Issues:** Check existing issues or create a new one
- **Community:** NestJS Discord, Stack Overflow

---

## Useful Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Happy coding! 🚀**
