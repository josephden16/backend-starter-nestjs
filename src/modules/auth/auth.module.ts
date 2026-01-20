import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { EmailModule } from 'src/shared/emails/email.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { TokenBlacklistService } from 'src/shared/security';

import { AdminAuthController } from './controllers/admin-auth.controller';
import { UserAuthController } from './controllers/user-auth.controller';
import { AdminAuthService } from './services/admin-auth.service';
import { UserAuthService } from './services/user-auth.service';

@Module({
  imports: [
    JwtModule.register({}),
    PrismaModule,
    EmailModule,
    NotificationsModule,
  ],
  controllers: [AdminAuthController, UserAuthController],
  providers: [AdminAuthService, UserAuthService, TokenBlacklistService],
  exports: [AdminAuthService, UserAuthService, TokenBlacklistService],
})
export class AuthModule {}
