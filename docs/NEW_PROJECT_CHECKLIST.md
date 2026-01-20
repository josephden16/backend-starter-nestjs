# New Project Checklist

Use this checklist when setting up a new project from this starter template.

## Initial Setup

- [ ] Clone the repository to a new directory
- [ ] Run setup script (`pnpm setup` or manually)
- [ ] Verify all dependencies installed successfully
- [ ] Confirm Prisma client generated

## Configuration

### Environment Variables

- [ ] Create `.env` file from `.env.example`
- [ ] Generate unique JWT secrets (use `openssl rand -base64 32`)
  - [ ] `JWT_SECRET`
  - [ ] `JWT_REFRESH_SECRET`
- [ ] Configure database connection
  - [ ] `DATABASE_URL`
- [ ] Configure Redis connection
  - [ ] `REDIS_HOST`
  - [ ] `REDIS_PORT`
- [ ] Set frontend/backend URLs
  - [ ] `FRONTEND_URL`
  - [ ] `BACKEND_URL`
- [ ] Configure mail service
  - [ ] `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`
  - [ ] Or `RESEND_API_KEY`, `RESEND_EMAIL_FROM`
- [ ] Configure Cloudinary (if using media storage)
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
- [ ] Set admin credentials
  - [ ] `ADMIN_EMAIL`
  - [ ] `ADMIN_PASSWORD`
  - [ ] `ADMIN_PHONE_NUMBER`
- [ ] Configure external services (if needed)
  - [ ] `GOOGLE_CLIENT_ID` (OAuth)
  - [ ] `PAYSTACK_*` (Payments)
  - [ ] `FIREBASE_*` (Push notifications)

### Project Metadata

- [ ] Update `package.json`
  - [ ] `name`
  - [ ] `version`
  - [ ] `description`
  - [ ] `author`
  - [ ] `repository`
  - [ ] `license`
- [ ] Update `README.md` with project-specific information
- [ ] Update `nest-cli.json` if needed (project name in sourceRoot)

## Database Setup

- [ ] Verify MongoDB is running
- [ ] Test database connection
- [ ] Review and customize `prisma/schema.prisma` for your data model
- [ ] Run `pnpm run prisma:generate` to generate Prisma client
- [ ] Run `pnpm run prisma:db:reset` to initialize database
- [ ] Verify seed data created successfully
- [ ] Test database queries with Prisma Studio (`pnpm run prisma:studio`)

## Security Hardening

### Secrets & Authentication

- [ ] All secrets are unique and not default values
- [ ] JWT secrets are at least 32 bytes of randomness
- [ ] Admin password is strong (not "admin" or "password")
- [ ] No secrets hardcoded in source files
- [ ] `.env` file is in `.gitignore`

### API Security

- [ ] CORS configured for your frontend domain (not `*` in production)
- [ ] Rate limiting configured appropriately
- [ ] Helmet middleware enabled
- [ ] Security headers configured
- [ ] Cookie settings secure (`httpOnly`, `secure`, `sameSite`)
- [ ] Input validation enabled on all endpoints
- [ ] SQL injection protection (using Prisma ORM)
- [ ] XSS protection enabled

### Database & Services

- [ ] MongoDB authentication enabled (not using default port in production)
- [ ] Redis password set (if exposed)
- [ ] Database connection uses TLS in production
- [ ] Service accounts have minimum required permissions

## Code Customization

### Remove/Update Template Code

- [ ] Remove example modules (if using setup script option)
- [ ] Update app name in all relevant files
- [ ] Customize error messages in `src/constants/`
- [ ] Update email templates in `src/shared/emails/`
- [ ] Customize Swagger API documentation metadata

### Add Your Features

- [ ] Plan your module structure
- [ ] Create new modules: `nest g module modules/feature-name`
- [ ] Define Prisma models for your domain
- [ ] Implement business logic in services
- [ ] Create DTOs with validation
- [ ] Add controllers with Swagger documentation
- [ ] Write unit tests for services
- [ ] Write integration tests for controllers

## Git Setup

- [ ] Initialize fresh git repository (if using setup script)
- [ ] Update `.gitignore` if needed
- [ ] Create initial commit
- [ ] Set up remote repository
  - [ ] Create repo on GitHub/GitLab/Bitbucket
  - [ ] Add remote: `git remote add origin <url>`
  - [ ] Push initial commit: `git push -u origin main`
- [ ] Set up branch protection rules
- [ ] Configure GitHub/GitLab CI/CD (optional)

## Development Workflow

### Code Quality Tools

- [ ] ESLint configuration reviewed and customized
- [ ] Prettier settings configured
- [ ] Husky pre-commit hooks working
- [ ] Commitlint configured for conventional commits
- [ ] Run `pnpm run lint` - no errors
- [ ] Run `pnpm run format` - code formatted

### Testing

- [ ] Jest configuration reviewed
- [ ] Test environment variables set
- [ ] Unit tests running: `pnpm run test`
- [ ] E2E tests running: `pnpm run test:e2e`
- [ ] Coverage reports generated: `pnpm run test:cov`
- [ ] Set coverage thresholds if needed

## Documentation

- [ ] Update README.md with:
  - [ ] Project description and purpose
  - [ ] Setup instructions specific to your project
  - [ ] API endpoint documentation or link to Swagger
  - [ ] Environment variables documentation
  - [ ] Deployment instructions
  - [ ] Contributing guidelines (if open source)
- [ ] Document custom modules in their directories
- [ ] Update or remove `docs/QUICKSTART.md` as needed
- [ ] Create API documentation with examples
- [ ] Document any non-standard setup steps

## API Documentation

- [ ] Swagger/OpenAPI configured and accessible
- [ ] All endpoints documented with @ApiOperation
- [ ] DTOs documented with @ApiProperty
- [ ] Response types documented with @ApiResponse
- [ ] Authentication documented with @ApiBearerAuth
- [ ] Example requests/responses added
- [ ] Test all documented endpoints

## Performance Optimization

- [ ] Database indexes defined for frequently queried fields
- [ ] Caching strategy implemented for hot data
- [ ] Bull queues configured for async tasks
- [ ] Connection pooling optimized
- [ ] Logging level appropriate for environment (debug vs production)
- [ ] File upload limits configured
- [ ] Response compression enabled

## Monitoring & Logging

- [ ] Winston logger configured
- [ ] Log rotation set up
- [ ] Error tracking configured (Sentry, Rollbar, etc.)
- [ ] Application monitoring set up (New Relic, Datadog, etc.)
- [ ] Health check endpoint tested: `/health` or `/api/health`
- [ ] Metrics endpoint configured (if using Prometheus)

## Production Preparation

### Environment

- [ ] Production `.env` file prepared (never commit this!)
- [ ] Environment variable validation configured
- [ ] Secrets stored in secure vault (AWS Secrets Manager, etc.)
- [ ] Production database provisioned and secured
- [ ] Redis instance provisioned (e.g., Redis Cloud)
- [ ] CDN configured for static assets (if applicable)

### Build & Deploy

- [ ] Production build tested: `pnpm run build`
- [ ] Production start tested: `pnpm run start:prod`
- [ ] PM2 or process manager configured
- [ ] Docker image built and tested (if using containers)
- [ ] Deployment pipeline configured (GitHub Actions, GitLab CI, etc.)
- [ ] Rollback strategy defined
- [ ] Database migration strategy defined

### Security (Production)

- [ ] All environment variables use production values
- [ ] HTTPS enforced (no HTTP)
- [ ] HSTS header enabled
- [ ] CSP (Content Security Policy) configured
- [ ] Rate limiting tuned for production traffic
- [ ] DDoS protection configured
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented

### Monitoring (Production)

- [ ] Application logs centralized
- [ ] Error alerts configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Database monitoring configured
- [ ] Redis monitoring configured
- [ ] Set up dashboards for key metrics

## Final Checks

- [ ] All tests passing
- [ ] No linting errors
- [ ] No TypeScript compilation errors
- [ ] Development server starts without errors
- [ ] API documentation accessible
- [ ] All endpoints respond correctly
- [ ] Authentication flow works end-to-end
- [ ] File uploads work (if applicable)
- [ ] Email sending works (test with dev email)
- [ ] Background jobs process correctly
- [ ] Database queries performant
- [ ] Error handling works as expected

## Post-Launch

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify backup systems
- [ ] Review security logs
- [ ] Collect user feedback
- [ ] Plan for scaling (if needed)
- [ ] Document lessons learned
- [ ] Update dependencies regularly
- [ ] Schedule security audits

---

## Quick Command Reference

```bash
# Setup
pnpm setup                      # Run setup script

# Development
pnpm run start:dev              # Start dev server
pnpm run prisma:studio          # View database

# Database
pnpm run prisma:generate        # Generate Prisma client
pnpm run prisma:db:reset        # Reset & seed database

# Code Quality
pnpm run lint                   # Lint code
pnpm run format                 # Format code
pnpm run test                   # Run tests
pnpm run test:cov               # Test with coverage

# Production
pnpm run build                  # Build for production
pnpm run start:prod             # Run production build
```

---

## Notes

- **Priority items** are marked with ⚠️ - complete these first
- **Security items** should never be skipped
- **Production items** are critical before going live
- Keep this checklist updated as your project evolves
- Consider creating project-specific checklists for recurring tasks

---

**Last Updated:** [Date]  
**Project:** [Your Project Name]  
**Version:** 1.0.0
