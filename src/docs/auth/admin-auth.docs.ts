import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  NotFoundResponse,
  UnauthorizedResponse,
  ValidationErrorResponse,
} from 'src/shared/swagger';

export const AdminLoginDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Admin login',
      description: `
Authenticates an admin user with email and password.

**Returns:**
- JWT access token (short-lived)
- JWT refresh token (long-lived)
- Admin profile information

**Security:**
- Requires valid admin credentials
- Inactive admins cannot log in
    `,
    }),
    ApiResponse({
      status: 200,
      description: 'Admin login successful',
      schema: {
        example: {
          status: 'success',
          message: 'Login successful',
          data: {
            admin: {
              id: 'clx1234567890abcdef',
              email: 'admin@example.com',
              firstName: 'Admin',
              lastName: 'User',
              role: 'ADMIN',
            },
            tokens: {
              accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
  );

export const AdminForgotPasswordDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Request password reset',
      description: `
Initiates the password reset process for an admin account.

**Flow:**
1. Admin provides their email address
2. If email exists, a 6-digit reset code is sent
3. Code is valid for a limited time

**Security:**
- Request IP is logged for security purposes
- Rate limited to prevent abuse
    `,
    }),
    ApiResponse({
      status: 200,
      description: 'Password reset code sent',
      schema: {
        example: {
          status: 'success',
          message: 'Password reset code sent to email',
          data: null,
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 404, type: NotFoundResponse }),
  );

export const AdminVerifyCodeDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Verify password reset code',
      description: `
Verifies the 6-digit password reset code sent to the admin's email.

**Returns:**
- A temporary reset token to be used for password reset

**Validation:**
- Code must not be expired
- Code must match exactly
- Limited attempts allowed
    `,
    }),
    ApiResponse({
      status: 200,
      description: 'Reset code verified successfully',
      schema: {
        example: {
          status: 'success',
          message: 'Reset code verified successfully',
          data: {
            resetToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            message: 'You can now reset your password',
          },
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 404, type: NotFoundResponse }),
  );

export const AdminResetPasswordDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Reset password with code',
      description: `
Sets a new password using the reset token obtained from code verification.

**Requirements:**
- Valid reset token from verify-code endpoint
- New password meeting security requirements
    `,
    }),
    ApiResponse({
      status: 200,
      description: 'Password reset successful',
      schema: {
        example: {
          status: 'success',
          message: 'Password reset successful',
          data: null,
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
  );

export const AdminRefreshTokenDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Refresh access token',
      description: `
Exchanges a valid refresh token for new access and refresh tokens.

**Security:**
- Refresh token is validated against blacklist
- Admin account status is verified
- Old tokens should be discarded
    `,
    }),
    ApiResponse({
      status: 200,
      description: 'Token refreshed successfully',
      schema: {
        example: {
          status: 'success',
          message: 'Token refreshed successfully',
          data: {
            tokens: {
              accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
      },
    }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
  );

export const AdminLogoutDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Logout and revoke tokens',
      description: `
Invalidates the current access and refresh tokens.

**Process:**
- Both tokens are added to Redis blacklist
- Tokens remain blacklisted until their natural expiry
    `,
    }),
    ApiResponse({
      status: 200,
      description: 'Logout successful',
      schema: {
        example: {
          status: 'success',
          message: 'Logout successful',
          data: null,
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
  );
