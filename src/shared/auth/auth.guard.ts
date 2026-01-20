import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { UserRole } from 'generated/prisma';
import { ConfigServiceType } from 'src/config';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { TokenBlacklistService } from 'src/shared/security';

import { CustomLogger } from '../logger/logger.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly accessTokenSecret: string;
  private readonly basicAuthEnabled: boolean;

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<ConfigServiceType, true>,
    private readonly tokenBlacklist: TokenBlacklistService,
    private readonly logger: CustomLogger,
  ) {
    this.accessTokenSecret = this.config.get<string>('JWT_SECRET');
    this.basicAuthEnabled =
      this.config.get<string>('BASIC_AUTH_ENABLED') === 'true';
  }
  /**
   * Determines if the current request is authorized by calling
   * the authenticateUser and authorizeUser methods.
   * @param context - The current execution context of the request.
   * @returns {Promise<boolean>} - Whether the user is authorized.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: { id: string; role: UserRole } }>();
    await this.authenticateUser(req);
    return this.authorizeUser(req, context);
  }
  /**
   * Authenticates the user by checking for Basic Auth or JWT in the request header.
   * For Basic Auth: validates credentials against database.
   * For JWT: Decodes the token, verifies it, and attaches the user info to the request.
   * @param req - The current request object.
   * @throws {UnauthorizedException} - If authentication fails.
   */
  private async authenticateUser(
    req: Request & { user?: { id: string; role: UserRole } },
  ): Promise<void> {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader || typeof bearerHeader !== 'string') {
      throw new UnauthorizedException(
        'Authorization header is missing or invalid.',
      );
    }

    const [authType, authValue] = bearerHeader.split(' ');

    if (this.basicAuthEnabled && authType.toLowerCase() === 'basic') {
      return await this.authenticateBasicAuth(authValue, req);
    }

    if (authType.toLowerCase() !== 'bearer' || !authValue) {
      throw new UnauthorizedException('Invalid authorization type.');
    }

    const isBlacklisted =
      await this.tokenBlacklist.isTokenBlacklisted(authValue);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked.');
    }

    // Existing JWT authentication
    try {
      const payload = await this.jwtService.verifyAsync(authValue, {
        secret: this.accessTokenSecret,
      });
      const id = payload?.sub;

      if (!id) {
        throw new UnauthorizedException('Invalid token: ID not present.');
      }

      const isUserBlacklisted = await this.tokenBlacklist.isUserBlacklisted(id);
      if (isUserBlacklisted) {
        throw new UnauthorizedException('User tokens have been revoked.');
      }

      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new UnauthorizedException('User not found.');
      }

      if (user.isDeleted || user.status === 'DELETED') {
        throw new UnauthorizedException('This account does not exist.');
      }

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException("You can't login at the moment.");
      }

      req.user = { id: user.id, role: user.role };
    } catch (err) {
      this.logger.error('AdminAuthGuard - authentication failed', {
        error: err,
      });
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired.');
      } else if (err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Malformed token.');
      } else {
        throw new UnauthorizedException('Authentication failed.');
      }
    }
  }
  /**
   * Authenticates using Basic Auth by decoding credentials and validating against database.
   * @param authValue - The Base64 encoded email:password string.
   * @param req - The request object to attach user info.
   * @throws {UnauthorizedException} - If credentials are invalid or user not found.
   */
  private async authenticateBasicAuth(
    authValue: string,
    req: Request & { user?: { id: string; role: UserRole } },
  ): Promise<void> {
    try {
      const decoded = Buffer.from(authValue, 'base64').toString('ascii');
      const [email, password] = decoded.split(':');

      if (!email || !password) {
        throw new UnauthorizedException(
          'Invalid Basic Auth credentials format.',
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('User not found.');
      }

      if (user.isDeleted || user.status === 'DELETED') {
        throw new UnauthorizedException('This account does not exist.');
      }

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException("You can't login at the moment.");
      }

      const isValidPassword = await bcrypt.compare(
        password,
        user.password ?? '',
      );

      if (!isValidPassword) {
        throw new BadRequestException('Wrong Credentials, try again.');
      }

      req.user = { id: user.id, role: user.role };
    } catch {
      throw new UnauthorizedException('Basic Auth authentication failed.');
    }
  }
  /**
   * Authorizes the user by checking if the user's role matches the required roles.
   * Logs a warning if the user attempts unauthorized access.
   * @param req - The current request object with the user info.
   * @param context - The execution context to get metadata like required roles.
   * @throws {UnauthorizedException} - If the user does not have the required permissions.
   * @returns {boolean} - Whether the user is authorized based on their role.
   */
  private authorizeUser(
    req: Request & { user?: { id: string; role: UserRole } },
    context: ExecutionContext,
  ): boolean {
    const requiredRoles = this.getMetadata<UserRole[]>('roles', context);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!req.user || !requiredRoles.includes(req.user.role)) {
      const ip = req.ip;
      Logger.warn(
        `Unauthorized attempt by user: ${req.user?.id || 'unknown'} from IP: ${ip}`,
      );
      throw new UnauthorizedException('Insufficient permissions.');
    }
    return true;
  }

  /**
   * Helper method to retrieve metadata such as required roles for a handler or class.
   * @param key - Metadata key.
   * @param context - The execution context to get handler and class.
   * @returns {T} - The retrieved metadata value.
   */
  private getMetadata<T>(key: string, context: ExecutionContext): T {
    return this.reflector.getAllAndOverride<T>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
