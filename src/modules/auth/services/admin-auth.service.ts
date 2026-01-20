import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { ConfigServiceType } from 'src/config';
import {
  BCRYPT_SALT_ROUNDS,
  DEFAULT_OTP,
  IS_DEVELOPMENT,
  OTP_EXPIRATION_TIME,
} from 'src/constants';
import { SuccessResponse } from 'src/helpers';
import { EmailService } from 'src/shared/emails/email.service';
import { CustomLogger } from 'src/shared/logger/logger.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { TokenBlacklistService } from 'src/shared/security';

import {
  AdminForgotPasswordDto,
  AdminLoginDto,
  AdminRefreshTokenDto,
  AdminResetPasswordDto,
  LogoutDto,
  VerifyCodeDto,
} from '../dto/admin';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AdminAuthService {
  private readonly PASSWORD_RESET_TYPE = 'ADMIN';
  private readonly MAX_PASSWORD_RESET_ATTEMPTS = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<ConfigServiceType, true>,
    private readonly emailService: EmailService,
    private readonly logger: CustomLogger,
    private readonly tokenBlacklist: TokenBlacklistService,
  ) {
    // eslint-disable-next-line sonarjs/no-async-constructor
    this.prisma.admin
      .count()
      .then(async (count) => {
        if (count === 0) {
          this.logger.log('No admin found, creating default admin user');
          const defaultFirstName = 'Admin';
          const defaultLastName = 'User';
          const defaultPassword = this.config.get<string>('ADMIN_PASSWORD');
          const defaultEmail = this.config.get<string>('ADMIN_EMAIL');
          const defaultPhoneNumber =
            this.config.get<string>('ADMIN_PHONE_NUMBER');

          const hashedPassword = await bcrypt.hash(
            defaultPassword,
            BCRYPT_SALT_ROUNDS,
          );

          await this.prisma.admin.create({
            data: {
              email: defaultEmail,
              password: hashedPassword,
              firstName: defaultFirstName,
              lastName: defaultLastName,
              phoneNumber: defaultPhoneNumber,
              isSuper: true,
              role: 'ADMIN',
            },
          });

          this.logger.log(
            `Default admin user created with email: ${defaultEmail}`,
          );
        } else {
          this.logger.log(`Admin users exist: ${count} found`);
        }
      })
      .catch((err) => {
        this.logger.error('Error checking/creating default admin user', {
          err,
        });
      });
  }

  async login(dto: AdminLoginDto) {
    this.logger.log('AdminAuthService.login called', { email: dto.email });
    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (!admin) {
      this.logger.error('AdminAuthService.login - admin not found', {
        email: dto.email,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    if (admin.isDeleted || admin.isSuspended) {
      this.logger.error('AdminAuthService.login - admin inactive', {
        id: admin.id,
      });
      throw new UnauthorizedException('Admin account is inactive');
    }

    const passwordMatch = await bcrypt.compare(dto.password, admin.password);

    if (!passwordMatch) {
      this.logger.error('AdminAuthService.login - invalid password', {
        id: admin.id,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = this.generateTokens(admin.id, admin.email, admin.role);

    this.logger.log('AdminAuthService.login succeeded', { id: admin.id });
    return SuccessResponse('Login successful', {
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
      tokens,
    });
  }

  async forgotPassword(dto: AdminForgotPasswordDto, requestIP?: string) {
    this.logger.log('AdminAuthService.forgotPassword called', {
      email: dto.email,
      requestIP,
    });
    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (!admin) {
      this.logger.error('AdminAuthService.forgotPassword - admin not found', {
        email: dto.email,
      });
      throw new NotFoundException('Admin not found');
    }

    const code = IS_DEVELOPMENT
      ? DEFAULT_OTP
      : randomInt(0, 10000).toString().padStart(4, '0');
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_TIME * 60 * 1000);

    await this.prisma.passwordReset.upsert({
      where: {
        email_type: {
          email: dto.email,
          type: this.PASSWORD_RESET_TYPE,
        },
      },
      create: {
        email: dto.email,
        code,
        type: this.PASSWORD_RESET_TYPE,
        expiresAt,
      },
      update: {
        code,
        expiresAt,
        attempts: 0,
      },
    });

    try {
      await this.emailService.sendAdminPasswordResetCode(
        admin.email,
        code,
        `${admin.firstName} ${admin.lastName}`,
        requestIP || 'Unknown',
      );
      this.logger.log('AdminAuthService.forgotPassword - email sent', {
        email: admin.email,
      });
    } catch (err) {
      this.logger.error(
        'AdminAuthService.forgotPassword - failed to send email',
        { err, email: admin.email },
      );
      throw new BadRequestException('Failed to send reset code email');
    }

    return SuccessResponse('Password reset code sent to email', null);
  }

  async verifyCode(dto: VerifyCodeDto) {
    this.logger.log('AdminAuthService.verifyCode called', { email: dto.email });
    const resetData = await this.prisma.passwordReset.findUnique({
      where: {
        email_type: {
          email: dto.email,
          type: this.PASSWORD_RESET_TYPE,
        },
      },
    });

    if (!resetData) {
      this.logger.error('AdminAuthService.verifyCode - no reset request', {
        email: dto.email,
      });
      throw new BadRequestException('No reset request found for this email');
    }

    if (new Date() > resetData.expiresAt) {
      await this.prisma.passwordReset.delete({
        where: {
          email_type: {
            email: dto.email,
            type: this.PASSWORD_RESET_TYPE,
          },
        },
      });
      this.logger.error('AdminAuthService.verifyCode - reset code expired', {
        email: dto.email,
      });
      throw new BadRequestException('Reset code expired');
    }

    if (resetData.attempts >= this.MAX_PASSWORD_RESET_ATTEMPTS) {
      await this.prisma.passwordReset.delete({
        where: {
          email_type: {
            email: dto.email,
            type: this.PASSWORD_RESET_TYPE,
          },
        },
      });
      this.logger.error('AdminAuthService.verifyCode - too many attempts', {
        email: dto.email,
      });
      throw new BadRequestException('Too many failed attempts');
    }

    if (resetData.code !== dto.code) {
      await this.prisma.passwordReset.update({
        where: {
          email_type: {
            email: dto.email,
            type: this.PASSWORD_RESET_TYPE,
          },
        },
        data: { attempts: resetData.attempts + 1 },
      });
      this.logger.error('AdminAuthService.verifyCode - invalid code', {
        email: dto.email,
      });
      throw new BadRequestException('Invalid reset code');
    }

    this.logger.log('AdminAuthService.verifyCode succeeded', {
      email: dto.email,
    });
    return SuccessResponse('Code verified successfully', {
      verified: true,
    });
  }

  async resetPassword(dto: AdminResetPasswordDto) {
    this.logger.log('AdminAuthService.resetPassword called', {
      email: dto.email,
    });
    const resetData = await this.prisma.passwordReset.findUnique({
      where: {
        email_type: {
          email: dto.email,
          type: this.PASSWORD_RESET_TYPE,
        },
      },
    });

    if (!resetData) {
      this.logger.error('AdminAuthService.resetPassword - no reset request', {
        email: dto.email,
      });
      throw new BadRequestException('No reset request found for this email');
    }

    if (new Date() > resetData.expiresAt) {
      await this.prisma.passwordReset.delete({
        where: {
          email_type: {
            email: dto.email,
            type: this.PASSWORD_RESET_TYPE,
          },
        },
      });
      this.logger.error('AdminAuthService.resetPassword - reset code expired', {
        email: dto.email,
      });
      throw new BadRequestException('Reset code expired');
    }

    if (resetData.code !== dto.code) {
      this.logger.error('AdminAuthService.resetPassword - invalid code', {
        email: dto.email,
      });
      throw new BadRequestException('Invalid reset code');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (!admin) {
      this.logger.error('AdminAuthService.resetPassword - admin not found', {
        email: dto.email,
      });
      throw new NotFoundException('Admin not found');
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      BCRYPT_SALT_ROUNDS,
    );

    await Promise.all([
      this.prisma.admin.update({
        where: { id: admin.id },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordReset.delete({
        where: {
          email_type: {
            email: dto.email,
            type: this.PASSWORD_RESET_TYPE,
          },
        },
      }),
    ]);

    this.logger.log('AdminAuthService.resetPassword succeeded', {
      adminId: admin.id,
    });
    return SuccessResponse('Password reset successfully', null);
  }

  async refreshToken(dto: AdminRefreshTokenDto) {
    this.logger.log('AdminAuthService.refreshToken called');
    try {
      const isBlacklisted = await this.tokenBlacklist.isTokenBlacklisted(
        dto.refreshToken,
      );
      if (isBlacklisted) {
        this.logger.error(
          'AdminAuthService.refreshToken - token is blacklisted',
        );
        throw new UnauthorizedException('Token has been revoked');
      }

      const decoded = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const isAdminBlacklisted = await this.tokenBlacklist.isAdminBlacklisted(
        decoded.sub,
      );
      if (isAdminBlacklisted) {
        this.logger.error(
          'AdminAuthService.refreshToken - admin tokens are blacklisted',
          { adminId: decoded.sub },
        );
        throw new UnauthorizedException('Admin tokens have been revoked');
      }

      const admin = await this.prisma.admin.findUnique({
        where: { id: decoded.sub },
      });

      if (!admin || admin.isDeleted || admin.isSuspended) {
        this.logger.error(
          'AdminAuthService.refreshToken - admin not found or inactive',
          { id: decoded.sub },
        );
        throw new UnauthorizedException('Admin not found or inactive');
      }

      const tokens = this.generateTokens(admin.id, admin.email, admin.role);

      this.logger.log('AdminAuthService.refreshToken succeeded', {
        id: admin.id,
      });
      return SuccessResponse('Token refreshed successfully', { tokens });
    } catch {
      this.logger.error('AdminAuthService.refreshToken - invalid token');
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(dto: LogoutDto, accessToken: string) {
    this.logger.log('AdminAuthService.logout called');

    try {
      const accessPayload = this.jwtService.decode(
        accessToken,
      ) as JwtPayload & {
        exp: number;
      };

      if (!accessPayload) {
        throw new BadRequestException('Invalid access token');
      }

      const now = Math.floor(Date.now() / 1000);

      const accessTTL = Math.max(0, accessPayload.exp - now);

      if (accessTTL > 0) {
        await this.tokenBlacklist.blacklistToken(accessToken, accessTTL);
      }

      if (dto.refreshToken) {
        const refreshPayload = this.jwtService.decode(
          dto.refreshToken,
        ) as JwtPayload & {
          exp: number;
        };

        if (refreshPayload) {
          const refreshTTL = Math.max(0, refreshPayload.exp - now);
          if (refreshTTL > 0) {
            await this.tokenBlacklist.blacklistToken(
              dto.refreshToken,
              refreshTTL,
            );
          }
        }
      }

      this.logger.log('AdminAuthService.logout - tokens revoked', {
        adminId: accessPayload.sub,
      });
      return SuccessResponse('Logout successful', null);
    } catch (error) {
      this.logger.error('AdminAuthService.logout failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return SuccessResponse('Logout successful', null);
    }
  }

  private generateTokens(
    adminId: string,
    email: string,
    role: string,
  ): { accessToken: string; refreshToken: string } {
    this.logger.log('AdminAuthService.generateTokens called', { adminId });
    const payload: JwtPayload = {
      sub: adminId,
      email,
      role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRY_TIME'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRY_TIME'),
    });

    return { accessToken, refreshToken };
  }
}
