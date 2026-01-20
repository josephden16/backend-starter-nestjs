import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  AdminLoginDocs,
  AdminForgotPasswordDocs,
  AdminVerifyCodeDocs,
  AdminResetPasswordDocs,
  AdminRefreshTokenDocs,
  AdminLogoutDocs,
} from 'src/docs/auth/admin-auth.docs';

import {
  AdminForgotPasswordDto,
  AdminLoginDto,
  AdminRefreshTokenDto,
  AdminResetPasswordDto,
  LogoutDto,
  VerifyCodeDto,
} from '../dto/admin';
import { AdminAuthService } from '../services/admin-auth.service';

@ApiTags('Admin Auth')
@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @Post('login')
  @AdminLoginDocs()
  async login(@Body() dto: AdminLoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  @AdminForgotPasswordDocs()
  async forgotPassword(
    @Body() dto: AdminForgotPasswordDto,
    @Req() req: Request,
  ) {
    const requestIP = req.ip || req.socket.remoteAddress || 'Unknown';
    return this.authService.forgotPassword(dto, requestIP);
  }

  @Post('verify-code')
  @AdminVerifyCodeDocs()
  async verifyCode(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyCode(dto);
  }

  @Post('reset-password')
  @AdminResetPasswordDocs()
  async resetPassword(@Body() dto: AdminResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('refresh')
  @AdminRefreshTokenDocs()
  async refreshToken(@Body() dto: AdminRefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  @AdminLogoutDocs()
  async logout(@Body() dto: LogoutDto, @Req() req: Request) {
    const accessToken = req.headers['authorization']?.split(' ')[1] || '';
    return this.authService.logout(dto, accessToken);
  }
}
