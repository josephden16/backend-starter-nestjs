import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AdminAuthGuard } from './admin-auth.guard';

interface AuthenticatedAdmin {
  id: string;
  role: string;
}

export const AllowAuthenticatedAdmin = (...roles: string[]) =>
  applyDecorators(SetMetadata('roles', roles), UseGuards(AdminAuthGuard));

export const GetAdmin = createParamDecorator(
  (_data, ctx: ExecutionContext): AuthenticatedAdmin | undefined => {
    const req = ctx
      .switchToHttp()
      .getRequest<Request & { admin?: AuthenticatedAdmin }>();
    return req.admin;
  },
);
