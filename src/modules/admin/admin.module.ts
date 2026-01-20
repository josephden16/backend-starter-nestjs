import { Module } from '@nestjs/common';
import { CloudinaryService } from 'src/lib/cloudinary/cloudinary.service';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { TokenBlacklistService } from 'src/shared/security';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminService, CloudinaryService, TokenBlacklistService],
  exports: [AdminService],
})
export class AdminModule {}
