import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  RegisterDocs,
  VerifyEmailDocs,
  ResendVerificationDocs,
  LoginDocs,
  LoginWithGoogleDocs,
  ForgotPasswordDocs,
  VerifyResetCodeDocs,
  ResetPasswordDocs,
  RefreshTokenDocs,
  LogoutDocs,
} from 'src/docs/auth/user-auth.docs';

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
import { UserAuthService } from '../services/user-auth.service';

@ApiTags('User Auth')
@Controller('auth/user')
export class UserAuthController {
  constructor(private readonly authService: UserAuthService) {}

  @Post('register')
  @RegisterDocs()
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  @VerifyEmailDocs()
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verification')
  @ResendVerificationDocs()
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto);
  }

  @Post('login')
  @LoginDocs()
  async login(@Body() dto: UserLoginDto) {
    return this.authService.login(dto);
  }

  @Post('login-google')
  @LoginWithGoogleDocs()
  async loginWithGoogle(@Body() dto: GoogleAuthDto) {
    return this.authService.loginWithGoogle(dto);
  }

  @Post('forgot-password')
  @ForgotPasswordDocs()
  async forgotPassword(@Body() dto: UserForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('verify-reset-code')
  @VerifyResetCodeDocs()
  async verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(dto);
  }

  @Post('reset-password')
  @ResetPasswordDocs()
  async resetPassword(@Body() dto: UserResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('refresh')
  @RefreshTokenDocs()
  async refreshToken(@Body() dto: UserRefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  @LogoutDocs()
  async logout(@Body() dto: UserLogoutDto, @Req() req: Request) {
    const accessToken = req.headers['authorization']?.split(' ')[1] || '';
    return this.authService.logout(dto, accessToken);
  }
}
