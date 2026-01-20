import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { SuccessResponse } from './helpers/success-response';

@Controller()
@ApiTags('App')
export class AppController {
  @Get('status')
  @ApiOperation({
    summary: 'Get application status',
    description: 'Returns the health status of the API along with request metadata.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      example: {
        status: 'success',
        message: 'Ok',
        data: {
          timestamp: '2025-01-15T10:30:00.000Z',
          IP: '127.0.0.1',
          URL: '/status',
        },
      },
    },
  })
  getAppStatus(@Req() req: Request) {
    return SuccessResponse('Ok', {
      timestamp: new Date().toISOString(),
      IP: req.ip,
      URL: req.originalUrl,
    });
  }
}
