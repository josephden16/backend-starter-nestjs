# Enterprise Backend Project - Copilot Instructions

## Project Overview

This is an **enterprise-grade NestJS backend application** using modern TypeScript patterns, Prisma ORM with MongoDB, and following best practices for security, performance, and maintainability.

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript 5.x
- **Database**: MongoDB via Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Validation**: class-validator, nestjs-zod
- **Task Queue**: Bull (Redis-backed)
- **Caching**: Redis
- **Session Management**: connect-redis, express-session
- **Email**: Resend, @nestjs-modules/mailer
- **File Upload**: Multer, Cloudinary
- **Logging**: Winston with rotating file streams
- **Rate Limiting**: @nestjs/throttler
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Package Manager**: pnpm

## Core Development Principles

### 1. **TypeScript Best Practices**

- Use strict mode and explicit types
- Prefer interfaces for data structures
- Use enums for fixed sets of values
- Avoid `any` type - use `unknown` when type is truly unknown
- Leverage TypeScript 5.x features (decorators, const assertions, etc.)

### 2. **NestJS Architecture**

- Follow dependency injection patterns
- Use modular architecture with feature modules
- Keep controllers thin - business logic in services
- Use DTOs for all input/output validation
- Implement guards for authentication and authorization
- Use interceptors for logging, transformation, and caching
- Create custom decorators for common patterns
- Use pipes for validation and transformation

### 3. **Database & Prisma**

- All database access through Prisma Client
- Use transactions for multi-step operations
- Implement proper error handling for database operations
- Use Prisma migrations for schema changes
- Never expose raw Prisma models - use DTOs
- Implement proper indexing for query performance
- Use Prisma's connection pooling efficiently

### 4. **Security First**

- Never commit secrets - use environment variables
- Implement rate limiting on all public endpoints
- Validate all input with class-validator decorators
- Sanitize user inputs to prevent injection attacks
- Use helmet for security headers
- Implement CORS appropriately
- Hash passwords with bcryptjs (never store plain text)
- Use JWT with appropriate expiration times
- Implement refresh token rotation
- Log security events for audit trails

### 5. **Error Handling**

- Use NestJS exception filters for consistent error responses
- Create custom exceptions when needed
- Log errors with appropriate context
- Never expose internal error details to clients
- Use proper HTTP status codes
- Implement graceful degradation

### 6. **Performance**

- Implement caching with Redis for frequently accessed data
- Use Bull queues for async/background tasks
- Optimize database queries (use `select`, avoid N+1)
- Implement pagination for list endpoints
- Use connection pooling
- Monitor and optimize slow endpoints
- Implement request compression

### 7. **Code Quality**

- Follow ESLint rules strictly
- Write meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Write unit tests for business logic
- Write integration tests for API endpoints
- Document complex business logic
- Use meaningful commit messages (conventional commits)

### 8. **API Design**

- RESTful endpoints with proper HTTP methods
- Consistent response formats
- Versioning strategy for breaking changes
- Comprehensive Swagger documentation
- Implement proper status codes
- Use query parameters for filtering/sorting
- Implement HATEOAS where applicable

### 9. **Logging & Monitoring**

- Use Winston for structured logging
- Log levels: error, warn, info, debug
- Include request IDs for tracing
- Log security events
- Don't log sensitive information (passwords, tokens)
- Implement log rotation
- Monitor application metrics

### 10. **Testing Strategy**

- Unit tests for services and utilities
- Integration tests for controllers
- E2E tests for critical user flows
- Mock external dependencies
- Aim for >80% code coverage
- Test edge cases and error conditions
- Use descriptive test names

## File Organization

```
src/
├── common/           # Shared utilities, decorators, guards, interceptors
├── config/           # Configuration modules and validation
├── modules/          # Feature modules (auth, users, etc.)
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   ├── guards/
│   │   └── strategies/
└── main.ts           # Application entry point
```

## Naming Conventions

- **Files**: kebab-case (e.g., `user-profile.service.ts`)
- **Classes**: PascalCase (e.g., `UserProfileService`)
- **Interfaces**: PascalCase with 'I' prefix or descriptive name (e.g., `IUserProfile` or `UserProfile`)
- **Methods/Functions**: camelCase (e.g., `getUserProfile()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **DTOs**: PascalCase with suffix (e.g., `CreateUserDto`, `UpdateUserDto`)
- **Enums**: PascalCase with descriptive values (e.g., `UserRole.ADMIN`)

## Environment Variables

Always use environment variables for:

- Database connection strings
- API keys and secrets
- JWT secrets
- Redis connection details
- External service credentials
- Feature flags
- Environment-specific configuration

## Code Review Checklist

When generating or reviewing code, ensure:

- [ ] TypeScript types are explicit and correct
- [ ] DTOs are used for validation
- [ ] Error handling is implemented
- [ ] Security best practices are followed
- [ ] Performance considerations are addressed
- [ ] Code is properly tested
- [ ] Logging is appropriate
- [ ] Documentation is clear
- [ ] No hardcoded secrets
- [ ] Follows project conventions

## Common Patterns

### Creating a New Feature Module

1. Generate module: `nest g module modules/feature`
2. Generate controller: `nest g controller modules/feature`
3. Generate service: `nest g service modules/feature`
4. Create DTOs in `dto/` folder
5. Implement validation with decorators
6. Add Swagger decorators for documentation
7. Write tests
8. Update module imports

### Database Operations

```typescript
// Always use Prisma transactions for multi-step operations
async transferData(fromId: string, toId: string) {
  return await this.prisma.$transaction(async (tx) => {
    const from = await tx.user.update({ where: { id: fromId }, data: { ... } });
    const to = await tx.user.update({ where: { id: toId }, data: { ... } });
    return { from, to };
  });
}
```

### Error Handling

```typescript
// Use custom exceptions
throw new NotFoundException(`User with ID ${id} not found`);
throw new BadRequestException('Invalid email format');
throw new UnauthorizedException('Invalid credentials');
```

## Dependencies Management

- Use `pnpm` for package management
- Keep dependencies updated (security patches)
- Review dependency licenses for enterprise compliance
- Avoid unnecessary dependencies
- Use exact versions for critical packages

## Deployment Considerations

- Use environment-specific configuration
- Implement health check endpoints
- Use process managers (PM2) for production
- Implement graceful shutdown
- Use Docker for containerization
- Implement proper logging in production
- Monitor application metrics
- Use Redis for session storage in production

## Related Instructions

This project uses additional specialized instruction files located in `.github/instructions/`:

- **nestjs.instructions.md** - Comprehensive NestJS patterns and best practices
- **security-and-owasp.instructions.md** - Security guidelines and OWASP recommendations
- **performance-optimization.instructions.md** - Performance optimization strategies
- **github-actions.instructions.md** - CI/CD pipeline best practices
- **docker.instructions.md** - Containerization best practices

These files are automatically loaded by GitHub Copilot and provide deep, specialized guidance for their respective domains.

---

**Remember**: This is an enterprise application. Prioritize security, maintainability, and performance in all code generation and suggestions.
