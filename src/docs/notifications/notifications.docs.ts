import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  NotFoundResponse,
  UnauthorizedResponse,
  ValidationErrorResponse,
} from 'src/shared/swagger';

export const RegisterDeviceTokenDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Register or update a Firebase device token',
      description: `
Registers a device token for push notifications.

**Use Cases:**
- New device registration
- Token refresh after app reinstall
- Updating existing token
    `,
    }),
    ApiResponse({
      status: 201,
      description: 'Device token registered',
      schema: {
        example: {
          status: 'success',
          message: 'Device token saved',
          data: {
            token: 'fcm_device_token_abc123...',
            platform: 'android',
          },
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
  );

export const ListNotificationsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'List notifications with pagination',
      description: `
Returns paginated list of user notifications.

**Includes:**
- Notification type and message
- Read status
- Related entity (job, application, etc.)
- Timestamp
    `,
    }),
    ApiResponse({
      status: 200,
      description: 'Notifications retrieved',
      schema: {
        example: {
          status: 'success',
          message: 'Notifications fetched',
          data: {
            items: [
              {
                id: 'notif123',
                templateKey: 'JOB_APPLICATION',
                title: 'New Application',
                body: 'John Doe applied to Senior Developer',
                isRead: false,
                data: { jobId: 'job123', applicationId: 'app456' },
                createdAt: '2025-01-15T10:00:00.000Z',
              },
            ],
            meta: {
              total: 50,
              unread: 12,
              limit: 20,
              offset: 0,
              hasMore: true,
            },
          },
        },
      },
    }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
  );

export const GetUnreadCountDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Fetch unread notification count',
      description: 'Returns the number of unread notifications for the user.',
    }),
    ApiResponse({
      status: 200,
      description: 'Unread count retrieved',
      schema: {
        example: {
          status: 'success',
          message: 'Unread count retrieved',
          data: { count: 12 },
        },
      },
    }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
  );

export const MarkNotificationReadDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Mark a notification as read/unread',
      description: 'Updates the read status of a single notification.',
    }),
    ApiResponse({
      status: 200,
      description: 'Notification updated',
      schema: {
        example: {
          status: 'success',
          message: 'Notification marked as read',
          data: {
            id: 'notif123',
            isRead: true,
          },
        },
      },
    }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
    ApiResponse({ status: 404, type: NotFoundResponse }),
  );

export const MarkNotificationsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Mark multiple notifications as read/unread',
      description: 'Batch update read status for multiple notifications.',
    }),
    ApiResponse({
      status: 200,
      description: 'Notifications updated',
      schema: {
        example: {
          status: 'success',
          message: 'Notifications updated',
          data: {
            updated: 5,
          },
        },
      },
    }),
    ApiResponse({ status: 400, type: ValidationErrorResponse }),
    ApiResponse({ status: 401, type: UnauthorizedResponse }),
  );
