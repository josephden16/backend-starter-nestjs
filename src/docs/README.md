# API Documentation Structure

This folder contains organized API documentation decorators for all controllers in the application. The documentation uses NestJS's `applyDecorators` utility to keep controllers clean and maintainable.

## Structure

```
docs/
├── auth/
│   ├── user-auth.docs.ts      # User authentication endpoints
│   ├── admin-auth.docs.ts     # Admin authentication endpoints
├── admin/
│   └── admin.docs.ts           # Admin management endpoints
├── notifications/
│   └── notifications.docs.ts   # Notification endpoints
└── index.ts                    # Central export point
```

## Usage

### In Controllers

Import the documentation decorators and apply them to your endpoints:

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetAllAdminsDocs } from 'src/docs/admin/admin.docs';

@ApiTags('Admin Management')
@Controller('admins')
export class AdminController {
  @Get()
  @GetAllAdminsDocs()
  async getAll() {
    // Implementation
  }
}
```

### Creating New Documentation

When adding a new endpoint, create a corresponding documentation decorator:

```typescript
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const YourEndpointDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Short description',
      description: 'Detailed description with markdown support',
    }),
    ApiResponse({
      status: 200,
      description: 'Success response',
      schema: {
        example: {
          status: 'success',
          message: 'Operation completed',
          data: {
            /* example data */
          },
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    // Add more responses as needed
  );
```

## Benefits

1. **Cleaner Controllers**: Controllers focus on routing and business logic
2. **Reusability**: Documentation can be reused across similar endpoints
3. **Maintainability**: Easy to update documentation in one place
4. **Consistency**: Ensures consistent documentation patterns
5. **Type Safety**: Full TypeScript support for all decorators

## Conventions

- Each documentation decorator should be named after the method it documents, suffixed with `Docs`
- Group related documentation in the same file
- Use descriptive examples in `ApiResponse` schemas
- Include all relevant HTTP status codes
- Add markdown formatting for better readability in Swagger UI
