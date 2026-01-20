import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigServiceType } from 'src/config';
import { ErrorMessages } from 'src/constants';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { TokenBlacklistService } from 'src/shared/security';

interface AdminUser {
  id: string;
  role: string;
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private readonly accessTokenSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<ConfigServiceType, true>,
    private readonly tokenBlacklist: TokenBlacklistService,
  ) {
    this.accessTokenSecret = this.config.get<string>('JWT_SECRET');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { admin?: AdminUser }>();
    await this.authenticateAdmin(req);
    return this.authorizeAdmin(req, context);
  }

  private async authenticateAdmin(
    req: Request & { admin?: AdminUser },
  ): Promise<void> {
    const bearerHeader = req.headers['authorization'];

    if (!bearerHeader || typeof bearerHeader !== 'string') {
      throw new UnauthorizedException(
        'Authorization header is missing or invalid',
      );
    }

    const [authType, authValue] = bearerHeader.split(' ');

    if (authType.toLowerCase() !== 'bearer' || !authValue) {
      throw new UnauthorizedException('Invalid authorization type');
    }

    const isBlacklisted =
      await this.tokenBlacklist.isTokenBlacklisted(authValue);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(authValue, {
        secret: this.accessTokenSecret,
      });

      const adminId = payload?.sub;

      if (!adminId) {
        throw new UnauthorizedException(
          ErrorMessages.INVALID_JWT_TOKEN_MESSAGE,
        );
      }

      const isAdminBlacklisted =
        await this.tokenBlacklist.isAdminBlacklisted(adminId);
      if (isAdminBlacklisted) {
        throw new UnauthorizedException('Admin tokens have been revoked.');
      }

      const admin = await this.prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!admin) {
        throw new UnauthorizedException('Admin not found');
      }

      if (admin.isDeleted) {
        throw new UnauthorizedException('Admin not found');
      }

      if (admin.isSuspended) {
        throw new UnauthorizedException(ErrorMessages.ADMIN_SUSPENDED_MESSAGE);
      }

      req.admin = { id: admin.id, role: admin.role };
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException(ErrorMessages.TOKEN_EXPIRED_MESSAGE);
      }

      if (err.name === 'JsonWebTokenError') {
        throw new BadRequestException(ErrorMessages.INVALID_JWT_TOKEN_MESSAGE);
      }

      if (err instanceof UnauthorizedException) {
        throw err;
      }

      throw new UnauthorizedException('Authentication failed');
    }
  }

  private authorizeAdmin(
    req: Request & { admin?: AdminUser },
    context: ExecutionContext,
  ): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const adminRole = req.admin?.role;

    if (!adminRole || !requiredRoles.includes(adminRole)) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return true;
  }
}
