import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import {
  NotFoundResponse,
  UnauthorizedResponse,
  ValidationErrorResponse,
} from 'src/shared/swagger';

export const GetAllAdminsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all admins',
      description: 'Returns paginated list of all admin users.',
    }),
    ApiResponse({
      status: 200,
      description: 'Admins retrieved successfully',
      schema: {
        example: {
          status: 'success',
          message: 'Admins retrieved successfully',
          data: {
            admins: [
              {
                id: 'admin123',
                email: 'admin@example.com',
                firstName: 'John',
                lastName: 'Admin',
                role: 'ADMIN',
                isActive: true,
                createdAt: '2025-01-01T00:00:00.000Z',
              },
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 5,
              totalPages: 1,
            },
          },
        },
      },
    }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
  );

export const GetMeDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get current admin profile',
      description: 'Returns the profile of the currently authenticated admin.',
    }),
    ApiResponse({
      status: 200,
      description: 'Profile retrieved successfully',
      schema: {
        example: {
          status: 'success',
          message: 'Profile retrieved successfully',
          data: {
            id: 'admin123',
            email: 'admin@example.com',
            firstName: 'John',
            lastName: 'Admin',
            role: 'ADMIN',
            profilePhoto: 'https://cloudinary.com/...',
            isActive: true,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        },
      },
    }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
  );

export const GetAdminByIdDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get admin by ID',
      description: 'Returns details of a specific admin user.',
    }),
    ApiResponse({
      status: 200,
      description: 'Admin retrieved successfully',
      schema: {
        example: {
          status: 'success',
          message: 'Admin retrieved successfully',
          data: {
            id: 'admin123',
            email: 'admin@example.com',
            firstName: 'John',
            lastName: 'Admin',
            role: 'ADMIN',
            isActive: true,
          },
        },
      },
    }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
    ApiResponse({ status: 404, type: NotFoundResponse }),
  );

export const CreateAdminDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create new admin (Super Admin only)',
      description: `
Creates a new admin account.

**Requirements:**
- Only Super Admins can create new admins
- Email must be unique
- Default password is sent via email
    `,
    }),
    ApiResponse({
      status: 201,
      description: 'Admin created successfully',
      schema: {
        example: {
          status: 'success',
          message: 'Admin created successfully',
          data: {
            id: 'admin456',
            email: 'newadmin@example.com',
            firstName: 'New',
            lastName: 'Admin',
            role: 'MODERATOR',
            isActive: true,
          },
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
  );

export const UpdateAdminDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update admin details',
      description: "Updates an admin user's details (Super Admin only).",
    }),
    ApiResponse({
      status: 200,
      description: 'Admin updated successfully',
      schema: {
        example: {
          status: 'success',
          message: 'Admin updated successfully',
          data: {
            id: 'admin123',
            email: 'admin@example.com',
            firstName: 'Updated',
            lastName: 'Admin',
            role: 'ADMIN',
          },
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
    ApiResponse({ status: 404, type: NotFoundResponse }),
  );

export const DeleteAdminDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete admin',
      description: `
Deletes an admin account.

**Restrictions:**
- Cannot delete your own account
- Cannot delete Super Admins
    `,
    }),
    ApiResponse({
      status: 200,
      description: 'Admin deleted successfully',
      schema: {
        example: {
          status: 'success',
          message: 'Admin deleted successfully',
          data: null,
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
    ApiResponse({ status: 404, type: NotFoundResponse }),
  );

export const UpdateProfileDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update own profile with optional photo upload',
      description: "Updates the authenticated admin's profile information.",
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Update profile with optional photo',
      schema: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            description: 'Admin first name',
          },
          lastName: {
            type: 'string',
            description: 'Admin last name',
          },
          profilePhoto: {
            type: 'string',
            format: 'binary',
            description: 'Profile photo file (JPEG, PNG, WebP, max 5MB)',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Profile updated successfully',
      schema: {
        example: {
          status: 'success',
          message: 'Profile updated successfully',
          data: {
            id: 'admin123',
            firstName: 'Updated',
            lastName: 'Name',
            profilePhoto: 'https://cloudinary.com/...',
          },
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
  );

export const UpdatePasswordDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update own password',
      description: "Changes the authenticated admin's password.",
    }),
    ApiResponse({
      status: 200,
      description: 'Password updated successfully',
      schema: {
        example: {
          status: 'success',
          message: 'Password updated successfully',
          data: null,
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
  );

export const ToggleAdminStatusDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Activate or deactivate admin',
      description: "Toggles an admin account's active status.",
    }),
    ApiResponse({
      status: 200,
      description: 'Status updated successfully',
      schema: {
        example: {
          status: 'success',
          message: 'Admin activated successfully',
          data: {
            id: 'admin123',
            isActive: true,
          },
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
    ApiResponse({ status: 404, type: NotFoundResponse }),
  );
