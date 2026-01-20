import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes, randomInt } from 'crypto';
import type { User } from 'generated/prisma';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { ConfigServiceType } from 'src/config';
import { BCRYPT_SALT_ROUNDS, OTP_EXPIRATION_TIME } from 'src/constants';
import { SuccessResponse } from 'src/helpers';
import { NotificationTemplateKey } from 'src/modules/notifications/notification.templates';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { EmailService } from 'src/shared/emails/email.service';
import { CustomLogger } from 'src/shared/logger/logger.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { TokenBlacklistService } from 'src/shared/security';
import { generateUsername } from 'src/utils';

import {
  GoogleAuthDto,
  RegisterDto,
  ResendVerificationDto,
  UserForgotPasswordDto,
  UserLoginDto,
  UserLogoutDto,
  UserRefreshTokenDto,
  UserResetPasswordDto,
  VerifyEmailDto,
  VerifyResetCodeDto,
} from '../dto/user';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class UserAuthService {
  private readonly PASSWORD_RESET_TYPE = 'USER';
  private readonly MAX_PASSWORD_RESET_ATTEMPTS = 3;
  private googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<ConfigServiceType, true>,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly logger: CustomLogger,
    private readonly tokenBlacklist: TokenBlacklistService,
  ) {
    const googleClientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const googleClientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    if (googleClientId && googleClientSecret) {
      this.googleClient = new OAuth2Client({
        client_id: googleClientId,
        client_secret: googleClientSecret,
      });
    }
  }

  async register(dto: RegisterDto) {
    this.logger.log('UserAuthService.register called', { email: dto.email });

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      this.logger.error('UserAuthService.register - user already exists', {
        email: dto.email,
      });
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        authMedium: 'Email',
        username: generateUsername(dto.firstName, dto.lastName),
        role: 'USER',
      },
    });

    await this.sendEmailVerificationCode(user);

    this.queueWelcomeNotification(user.id, user.firstName);

    const tokens = this.generateTokens(user.id, user.email, user.role);

    this.logger.log('UserAuthService.register succeeded', { id: user.id });
    return SuccessResponse(
      'User registered successfully. Please verify your email.',
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        message: 'Verification code sent to your email',
        tokens,
      },
    );
  }

  private async queueWelcomeNotification(userId: string, firstName: string) {
    try {
      await this.notificationsService.createNotification({
        userId,
        templateKey: NotificationTemplateKey.Welcome,
        context: { firstName },
      });
    } catch (error) {
      this.logger.error('Failed to enqueue welcome notification', {
        userId,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  async verifyEmail(dto: VerifyEmailDto) {
    this.logger.log('UserAuthService.verifyEmail called', {
      email: dto.email,
    });

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.error('UserAuthService.verifyEmail - user not found', {
        email: dto.email,
      });
      throw new NotFoundException('Please check your email and try again');
    }

    const emailVerification = await this.prisma.emailVerification.findUnique({
      where: {
        email_type: {
          email: dto.email,
          type: 'SIGNUP',
        },
      },
    });

    if (!emailVerification) {
      this.logger.error(
        'UserAuthService.verifyEmail - no verification code found',
        { email: dto.email },
      );
      throw new BadRequestException('Please request a new verification code');
    }

    if (emailVerification.expiresAt < new Date()) {
      this.logger.error(
        'UserAuthService.verifyEmail - verification code expired',
        { email: dto.email },
      );
      throw new BadRequestException('Verification code expired');
    }

    if (emailVerification.code !== dto.code) {
      this.logger.error(
        'UserAuthService.verifyEmail - invalid verification code',
        { email: dto.email },
      );
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    await this.prisma.emailVerification.delete({
      where: {
        email_type: {
          email: dto.email,
          type: 'SIGNUP',
        },
      },
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    this.logger.log('UserAuthService.verifyEmail succeeded', { id: user.id });
    return SuccessResponse('Email verified successfully', {
      user: {
        id: updatedUser?.id ?? user.id,
        email: updatedUser?.email ?? user.email,
        firstName: updatedUser?.firstName ?? user.firstName,
        lastName: updatedUser?.lastName ?? user.lastName,
        role: updatedUser?.role ?? user.role,
      },
      tokens,
    });
  }

  async resendVerification(dto: ResendVerificationDto) {
    this.logger.log('UserAuthService.resendVerification called', {
      email: dto.email,
    });

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.error('UserAuthService.resendVerification - user not found', {
        email: dto.email,
      });
      throw new NotFoundException('Please check your email and try again');
    }

    if (user.emailVerified) {
      this.logger.log(
        'UserAuthService.resendVerification - email already verified',
        { email: dto.email },
      );
      throw new BadRequestException('Email already verified');
    }

    await this.sendEmailVerificationCode(user);

    this.logger.log('UserAuthService.resendVerification succeeded', {
      id: user.id,
    });
    return SuccessResponse('Verification code sent to your email', {
      message: 'Check your email for the verification code',
    });
  }

  async login(dto: UserLoginDto) {
    this.logger.log('UserAuthService.login called', { email: dto.email });

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.error('UserAuthService.login - user not found', {
        email: dto.email,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerified) {
      this.logger.error('UserAuthService.login - email not verified', {
        id: user.id,
      });

      await this.sendEmailVerificationCode(user);
      return SuccessResponse('Please verify your email first', {
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        emailVerified: false,
        tokens: null,
      });
    }

    if (user.isDeleted || user.status === 'DELETED') {
      this.logger.error('UserAuthService.login - user account deleted', {
        id: user.id,
      });
      throw new UnauthorizedException('This account does not exist');
    }

    if (user.status !== 'ACTIVE') {
      this.logger.error('UserAuthService.login - user inactive', {
        id: user.id,
      });
      throw new UnauthorizedException(`You can't login at the moment`);
    }

    if (!user.password) {
      this.logger.error(
        'UserAuthService.login - no password for email auth user',
        { id: user.id },
      );
      throw new UnauthorizedException(
        'Please use the appropriate login method for your account',
      );
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatch) {
      this.logger.error('UserAuthService.login - invalid password', {
        id: user.id,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    this.logger.log('UserAuthService.login succeeded', { id: user.id });
    return SuccessResponse('Login successful', {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens,
    });
  }

  private async sendEmailVerificationCode(user: {
    email: string;
    firstName: string;
    lastName: string;
  }) {
    const verificationCode = String(randomInt(100000, 999999));

    await this.prisma.emailVerification.upsert({
      where: {
        email_type: {
          email: user.email,
          type: 'SIGNUP',
        },
      },
      create: {
        email: user.email,
        code: verificationCode,
        type: 'SIGNUP',
        expiresAt: new Date(Date.now() + OTP_EXPIRATION_TIME * 60 * 1000),
      },
      update: {
        code: verificationCode,
        expiresAt: new Date(Date.now() + OTP_EXPIRATION_TIME * 60 * 1000),
        attempts: 0,
      },
    });

    await this.emailService.sendEmailVerification(
      user.email,
      verificationCode,
      `${user.firstName} ${user.lastName}`,
    );
  }

  async loginWithGoogle(dto: GoogleAuthDto) {
    this.logger.log('UserAuthService.loginWithGoogle called');

    if (!this.googleClient) {
      this.logger.error(
        'UserAuthService.loginWithGoogle - Google client not configured',
      );
      throw new BadRequestException('Google authentication not configured');
    }

    try {
      const payload = await this.verifyGoogleToken(dto.idToken);
      let user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });

      let isNewUser = false;

      if (!user) {
        user = await this.createGoogleUser(payload, dto);
        isNewUser = true;
      } else {
        await this.updateExistingGoogleUser(user);
        const refreshedUser = await this.prisma.user.findUnique({
          where: { id: user.id },
        });
        if (refreshedUser) {
          user = refreshedUser;
        }
      }

      if (!user || user.isDeleted || user.status !== 'ACTIVE') {
        this.logger.error('UserAuthService.loginWithGoogle - user inactive', {
          id: user?.id,
        });
        throw new UnauthorizedException('User account is not active');
      }

      const tokens = this.generateTokens(user.id, user.email, user.role);

      this.logger.log('UserAuthService.loginWithGoogle succeeded', {
        id: user.id,
      });
      return SuccessResponse('Google login successful', {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tokens,
        isNewUser,
      });
    } catch (error) {
      this.logger.error(
        'UserAuthService.loginWithGoogle - verification failed',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  private async verifyGoogleToken(idToken: string): Promise<TokenPayload> {
    const ticket = await this.googleClient!.verifyIdToken({ idToken });
    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.name) {
      throw new Error('Invalid token payload');
    }

    return payload;
  }

  private async createGoogleUser(payload: TokenPayload, dto: GoogleAuthDto) {
    this.logger.log('UserAuthService.loginWithGoogle - creating new user', {
      email: payload.email,
    });

    const nameParts = payload.name!.split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    const user = await this.prisma.user.create({
      data: {
        email: payload.email!,
        firstName,
        lastName,
        phoneNumber: '',
        authMedium: 'Google',
        emailVerified: true,
        username: generateUsername(firstName, lastName),
        role: 'USER',
      },
    });

    this.logger.log('UserAuthService.loginWithGoogle - new user created', {
      id: user.id,
    });

    return user;
  }

  private async updateExistingGoogleUser(user: User) {
    if (!user.emailVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }
  }

  async forgotPassword(dto: UserForgotPasswordDto) {
    this.logger.log('UserAuthService.forgotPassword called', {
      email: dto.email,
    });

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.error('UserAuthService.forgotPassword - user not found', {
        email: dto.email,
      });
      throw new NotFoundException('Invalid email');
    }

    const code = String(randomInt(100000, 999999));

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
        expiresAt: new Date(Date.now() + OTP_EXPIRATION_TIME * 60 * 1000),
      },
      update: {
        code,
        expiresAt: new Date(Date.now() + OTP_EXPIRATION_TIME * 60 * 1000),
        attempts: 0,
        verifiedAt: null,
      },
    });

    await this.emailService.sendUserPasswordResetCode(
      dto.email,
      code,
      `${user.firstName} ${user.lastName}`,
    );

    this.logger.log('UserAuthService.forgotPassword succeeded', {
      email: dto.email,
    });
    return SuccessResponse('Password reset code sent to your email', null);
  }

  async verifyResetCode(dto: VerifyResetCodeDto) {
    this.logger.log('UserAuthService.verifyResetCode called', {
      email: dto.email,
    });

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.error('UserAuthService.verifyResetCode - user not found', {
        email: dto.email,
      });
      throw new NotFoundException('Invalid email');
    }

    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: {
        email_type: {
          email: dto.email,
          type: this.PASSWORD_RESET_TYPE,
        },
      },
    });

    if (!passwordReset) {
      this.logger.error(
        'UserAuthService.verifyResetCode - no reset code found',
        { email: dto.email },
      );
      throw new BadRequestException('Please request a password reset first');
    }

    if (passwordReset.expiresAt < new Date()) {
      this.logger.error('UserAuthService.verifyResetCode - code expired', {
        email: dto.email,
      });
      throw new BadRequestException('Password reset code expired');
    }

    if (passwordReset.attempts >= this.MAX_PASSWORD_RESET_ATTEMPTS) {
      this.logger.error(
        'UserAuthService.verifyResetCode - max attempts exceeded',
        { email: dto.email },
      );
      throw new BadRequestException(
        'Too many failed attempts. Please request a new reset code.',
      );
    }

    if (passwordReset.code !== dto.code) {
      await this.prisma.passwordReset.update({
        where: {
          email_type: {
            email: dto.email,
            type: this.PASSWORD_RESET_TYPE,
          },
        },
        data: { attempts: passwordReset.attempts + 1 },
      });

      this.logger.error('UserAuthService.verifyResetCode - invalid code', {
        email: dto.email,
      });
      throw new BadRequestException('Invalid reset code');
    }

    await this.prisma.passwordReset.update({
      where: {
        email_type: {
          email: dto.email,
          type: this.PASSWORD_RESET_TYPE,
        },
      },
      data: { verifiedAt: new Date() },
    });

    const resetToken = this.jwtService.sign(
      { email: dto.email, purpose: 'password-reset' },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      },
    );

    this.logger.log('UserAuthService.verifyResetCode succeeded', {
      email: dto.email,
    });
    return SuccessResponse('Reset code verified successfully', {
      resetToken,
      message: 'You can now reset your password',
    });
  }

  async resetPassword(dto: UserResetPasswordDto) {
    this.logger.log('UserAuthService.resetPassword called');

    try {
      const payload = this.jwtService.verify<{
        email: string;
        purpose: string;
      }>(dto.resetToken, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      if (payload.purpose !== 'password-reset') {
        this.logger.error(
          'UserAuthService.resetPassword - invalid token purpose',
        );
        throw new UnauthorizedException('Invalid reset token');
      }

      const email = payload.email;

      this.logger.log('UserAuthService.resetPassword - token verified', {
        email,
      });

      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        this.logger.error('UserAuthService.resetPassword - user not found', {
          email,
        });
        throw new NotFoundException('Invalid reset token');
      }

      const passwordReset = await this.prisma.passwordReset.findUnique({
        where: {
          email_type: {
            email,
            type: this.PASSWORD_RESET_TYPE,
          },
        },
      });

      if (!passwordReset) {
        this.logger.error(
          'UserAuthService.resetPassword - no reset record found',
          { email },
        );
        throw new BadRequestException('Please request a password reset first');
      }

      if (!passwordReset.verifiedAt) {
        this.logger.error('UserAuthService.resetPassword - code not verified', {
          email,
        });
        throw new BadRequestException('Please verify your reset code first');
      }

      if (passwordReset.expiresAt < new Date()) {
        this.logger.error('UserAuthService.resetPassword - code expired', {
          email,
        });
        throw new BadRequestException('Password reset code expired');
      }

      const hashedPassword = await bcrypt.hash(
        dto.newPassword,
        BCRYPT_SALT_ROUNDS,
      );

      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      await this.prisma.passwordReset.delete({
        where: {
          email_type: {
            email,
            type: this.PASSWORD_RESET_TYPE,
          },
        },
      });

      this.logger.log('UserAuthService.resetPassword succeeded', {
        id: user.id,
      });
      return SuccessResponse('Password reset successful', null);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        'UserAuthService.resetPassword - token verification failed',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  async refreshToken(dto: UserRefreshTokenDto) {
    this.logger.log('UserAuthService.refreshToken called');

    try {
      const isBlacklisted = await this.tokenBlacklist.isTokenBlacklisted(
        dto.refreshToken,
      );
      if (isBlacklisted) {
        this.logger.error(
          'UserAuthService.refreshToken - token is blacklisted',
        );
        throw new UnauthorizedException('Token has been revoked');
      }

      const payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const isUserBlacklisted = await this.tokenBlacklist.isUserBlacklisted(
        payload.sub,
      );
      if (isUserBlacklisted) {
        this.logger.error(
          'UserAuthService.refreshToken - user tokens are blacklisted',
          { userId: payload.sub },
        );
        throw new UnauthorizedException('User tokens have been revoked');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.isDeleted || user.status !== 'ACTIVE') {
        this.logger.error(
          'UserAuthService.refreshToken - user not found or inactive',
          {
            id: payload.sub,
          },
        );
        throw new UnauthorizedException('Please log in again');
      }

      const tokens = this.generateTokens(user.id, user.email, user.role);

      this.logger.log('UserAuthService.refreshToken succeeded', {
        id: user.id,
      });
      return SuccessResponse('Token refreshed successfully', { tokens });
    } catch (error) {
      this.logger.error('UserAuthService.refreshToken - verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(dto: UserLogoutDto, accessToken: string) {
    this.logger.log('UserAuthService.logout called');

    try {
      const accessPayload = this.jwtService.decode(
        accessToken,
      ) as JwtPayload & {
        exp: number;
      };
      const refreshPayload = this.jwtService.decode(
        dto.refreshToken,
      ) as JwtPayload & {
        exp: number;
      };

      if (!accessPayload || !refreshPayload) {
        throw new BadRequestException('Invalid tokens');
      }

      const now = Math.floor(Date.now() / 1000);

      const accessTTL = Math.max(0, accessPayload.exp - now);
      const refreshTTL = Math.max(0, refreshPayload.exp - now);

      if (accessTTL > 0) {
        await this.tokenBlacklist.blacklistToken(accessToken, accessTTL);
      }
      if (refreshTTL > 0) {
        await this.tokenBlacklist.blacklistToken(dto.refreshToken, refreshTTL);
      }

      this.logger.log('UserAuthService.logout - tokens revoked', {
        userId: accessPayload.sub,
      });
      return SuccessResponse('Logout successful', null);
    } catch (error) {
      this.logger.error('UserAuthService.logout failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return SuccessResponse('Logout successful', null);
    }
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = {
      sub: userId,
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
