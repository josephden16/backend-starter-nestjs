import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  NotFoundResponse,
  UnauthorizedResponse,
  ValidationErrorResponse,
} from 'src/shared/swagger';

export const RegisterDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Register new user',
      description: `
Creates a new user account and sends a verification email.

**Flow:**
1. User submits registration details
2. Account is created with unverified email status
3. 6-digit verification code is sent to email
4. JWT tokens are returned for immediate use

    `,
    }),
    ApiResponse({
      status: 201,
      description: 'User registered successfully',
      schema: {
        example: {
          status: 'success',
          message: 'User registered successfully. Please verify your email.',
          data: {
            user: {
              id: 'clx1234567890abcdef',
              email: 'user@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'USER',
            },
            message: 'Verification code sent to your email',
            tokens: {
              accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
  );

export const VerifyEmailDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Verify email with code',
      description:
        'Verifies user email using the 6-digit code sent during registration.',
    }),
    ApiResponse({
      status: 200,
      description: 'Email verified successfully',
      schema: {
        example: {
          status: 'success',
          message: 'Email verified successfully',
          data: {
            user: {
              id: 'clx1234567890abcdef',
              email: 'user@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'USER',
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
    ApiResponse({ status: 404, type: NotFoundResponse }),
  );

export const ResendVerificationDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Resend verification code',
      description: 'Resends the email verification code to the user.',
    }),
    ApiResponse({
      status: 200,
      description: 'Verification code sent',
      schema: {
        example: {
          status: 'success',
          message: 'Verification code sent to your email',
          data: { message: 'Check your email for the verification code' },
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 404, type: NotFoundResponse }),
  );

export const LoginDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Login with email and password',
      description: `
Authenticates user with email and password credentials.

**Returns:**
- JWT access token (short-lived)
- JWT refresh token (long-lived)
- User profile information

**Special Cases:**
- Unverified email: Returns \`emailVerified: false\` and resends verification code
- Deleted/suspended account: Returns 401 Unauthorized
    `,
    }),
    ApiResponse({
      status: 200,
      description: 'Login successful',
      schema: {
        example: {
          status: 'success',
          message: 'Login successful',
          data: {
            user: {
              id: 'clx1234567890abcdef',
              email: 'user@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'USER',
            },
            tokens: {
              accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            deviceToken: null,
          },
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
  );

export const LoginWithGoogleDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Login or signup with Google',
      description:
        'Authenticates or registers user using Google OAuth. Email is pre-verified.',
    }),
    ApiResponse({
      status: 200,
      description: 'Google login successful',
      schema: {
        example: {
          status: 'success',
          message: 'Google login successful',
          data: {
            user: {
              id: 'clx1234567890abcdef',
              email: 'user@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'USER',
            },
            tokens: {
              accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            deviceToken: null,
            isNewUser: false,
          },
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
  );

export const ForgotPasswordDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Request password reset',
      description: 'Sends a 6-digit password reset code to the user email.',
    }),
    ApiResponse({
      status: 200,
      description: 'Reset code sent',
      schema: {
        example: {
          status: 'success',
          message: 'Password reset code sent to your email',
          data: null,
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 404, type: NotFoundResponse }),
  );

export const VerifyResetCodeDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Verify password reset code',
      description:
        'Verifies the 6-digit code and returns a temporary reset token.',
    }),
    ApiResponse({
      status: 200,
      description: 'Reset code verified',
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

export const ResetPasswordDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Reset password with verified code',
      description:
        'Sets a new password using the reset token from verification.',
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

export const RefreshTokenDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Refresh access token',
      description: 'Exchanges a valid refresh token for new tokens.',
    }),
    ApiResponse({
      status: 200,
      description: 'Tokens refreshed successfully',
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

export const LogoutDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Logout and revoke tokens',
      description: 'Blacklists the access and refresh tokens.',
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
