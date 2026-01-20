import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { ConfigServiceType } from 'src/config';
import { CustomLogger } from 'src/shared/logger/logger.service';

import {
  NOTIFICATIONS_QUEUE,
  NOTIFICATIONS_RETENTION_JOB,
  NOTIFICATIONS_RETENTION_JOB_ID,
  NOTIFICATIONS_SEND_JOB,
} from './notifications.constants';

export interface SendNotificationJobData {
  notificationId: string;
}

export interface RetentionJobData {
  retentionDays: number;
}

@Injectable()
export class NotificationsQueue implements OnModuleInit {
  constructor(
    @InjectQueue(NOTIFICATIONS_QUEUE) private readonly queue: Queue,
    private readonly configService: ConfigService<ConfigServiceType>,
    private readonly logger: CustomLogger,
  ) {}

  async onModuleInit() {
    await this.ensureRetentionJob();
  }

  async enqueueSendNotification(notificationId: string) {
    this.logger.log('Queueing push notification', { notificationId });
    await this.queue.add(
      NOTIFICATIONS_SEND_JOB,
      { notificationId },
      {
        attempts: 4,
        backoff: {
          type: 'exponential',
          delay: 5_000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  private async ensureRetentionJob() {
    const retentionDays =
      this.configService.get<number>('FIREBASE_NOTIFICATIONS_RETENTION_DAYS') ??
      90;

    await this.queue.add(
      NOTIFICATIONS_RETENTION_JOB,
      { retentionDays },
      {
        repeat: {
          cron: '0 2 * * *',
        },
        jobId: NOTIFICATIONS_RETENTION_JOB_ID,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }
}
