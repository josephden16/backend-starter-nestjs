import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';

import {
  NotFoundResponse,
  UnauthorizedResponse,
  ValidationErrorResponse,
} from './api-response.schemas';

/**
 * Common error responses decorator - adds 400, 401, 404
 */
export function ApiCommonErrors() {
  return applyDecorators(
    ApiExtraModels(
      ValidationErrorResponse,
      UnauthorizedResponse,
      NotFoundResponse,
    ),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Validation failed',
      type: ValidationErrorResponse,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing authentication',
      type: UnauthorizedResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Resource does not exist',
      type: NotFoundResponse,
    }),
  );
}

/**
 * Auth-only errors (401 only)
 */
export function ApiAuthErrors() {
  return applyDecorators(
    ApiExtraModels(UnauthorizedResponse),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing authentication',
      type: UnauthorizedResponse,
    }),
  );
}

/**
 * Validation errors only (400)
 */
export function ApiValidationErrors() {
  return applyDecorators(
    ApiExtraModels(ValidationErrorResponse),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Validation failed',
      type: ValidationErrorResponse,
    }),
  );
}

/**
 * Not found error only (404)
 */
export function ApiNotFoundError(resource = 'Resource') {
  return applyDecorators(
    ApiExtraModels(NotFoundResponse),
    ApiResponse({
      status: 404,
      description: `${resource} not found`,
      type: NotFoundResponse,
    }),
  );
}
