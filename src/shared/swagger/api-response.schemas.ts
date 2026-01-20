import { ApiProperty } from '@nestjs/swagger';

// ==================== ERROR RESPONSE SCHEMAS ====================
// These are simple, flat schemas without circular references

export class ValidationErrorResponse {
  @ApiProperty({ example: 'error' })
  status: string;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({
    example: ['email must be a valid email', 'password is required'],
    type: [String],
  })
  errors: string[];

  @ApiProperty({ example: 400 })
  statusCode: number;
}

export class UnauthorizedResponse {
  @ApiProperty({ example: 'error' })
  status: string;

  @ApiProperty({ example: 'Unauthorized' })
  message: string;

  @ApiProperty({ example: 401 })
  statusCode: number;
}

export class NotFoundResponse {
  @ApiProperty({ example: 'error' })
  status: string;

  @ApiProperty({ example: 'Resource not found' })
  message: string;

  @ApiProperty({ example: 404 })
  statusCode: number;
}
