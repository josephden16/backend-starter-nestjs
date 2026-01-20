import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/shared/firebase';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

import { NOTIFICATIONS_QUEUE } from './notifications.constants';
import { NotificationsController } from './notifications.controller';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsQueue } from './notifications.queue';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    PrismaModule,
    FirebaseModule,
    BullModule.registerQueue({
      name: NOTIFICATIONS_QUEUE,
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationsQueue,
    NotificationsProcessor,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
