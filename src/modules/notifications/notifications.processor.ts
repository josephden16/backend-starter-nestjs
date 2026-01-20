import { Process, Processor } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { NotificationStatus, UserNotification } from 'generated/prisma';
import { ConfigServiceType } from 'src/config';
import { FIREBASE_ADMIN } from 'src/shared/firebase';
import { CustomLogger } from 'src/shared/logger/logger.service';

import {
  NOTIFICATIONS_QUEUE,
  NOTIFICATIONS_RETENTION_JOB,
  NOTIFICATIONS_SEND_JOB,
} from './notifications.constants';
import {
  RetentionJobData,
  SendNotificationJobData,
} from './notifications.queue';
import { NotificationsRepository } from './notifications.repository';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

@Injectable()
@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor {
  constructor(
    private readonly repository: NotificationsRepository,
    private readonly logger: CustomLogger,
    private readonly configService: ConfigService<ConfigServiceType>,
    @Inject(FIREBASE_ADMIN) private readonly firebaseApp: App,
  ) {}

  @Process(NOTIFICATIONS_SEND_JOB)
  async handleSendNotification(job: Job<SendNotificationJobData>) {
    const notificationId = job.data.notificationId;
    const notification =
      await this.repository.findNotificationById(notificationId);

    if (!notification) {
      this.logger.warn('Notification not found for job', {
        notificationId,
      });
      return;
    }

    try {
      const tokens = await this.repository.getDeviceTokens(notification.userId);
      if (!tokens.length) {
        await this.repository.updateNotificationStatus(notification.id, {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
          failureReason: null,
        });
        this.logger.log('No device tokens available for user', {
          userId: notification.userId,
          notificationId,
        });
        return;
      }

      const payload = {
        tokens: tokens.map((token) => token.token),
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: this.buildData(notification),
      };

      const response = await getMessaging(
        this.firebaseApp,
      ).sendEachForMulticast(payload);

      const invalidTokens: string[] = [];
      response.responses.forEach((result, index) => {
        if (!result.success && result.error) {
          const code = result.error.code;
          if (code === 'messaging/registration-token-not-registered') {
            invalidTokens.push(tokens[index].token);
          }
        }
      });

      if (invalidTokens.length) {
        await this.repository.deleteDeviceTokens(invalidTokens);
        this.logger.warn('Removed invalid notification tokens', {
          invalidTokenCount: invalidTokens.length,
        });
      }

      await this.repository.updateNotificationStatus(notification.id, {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        failureReason: null,
      });
    } catch (error) {
      this.logger.error('Failed to deliver push notification', {
        notificationId,
        error: error instanceof Error ? error.message : error,
      });
      await this.repository.updateNotificationStatus(notificationId, {
        status: NotificationStatus.FAILED,
        failureReason:
          error instanceof Error ? error.message : 'Unknown push error',
      });
      throw error;
    }
  }

  @Process(NOTIFICATIONS_RETENTION_JOB)
  async handleRetention(job: Job<RetentionJobData>) {
    const retentionDays =
      job.data?.retentionDays ??
      this.configService.get<number>('FIREBASE_NOTIFICATIONS_RETENTION_DAYS') ??
      90;

    const cutoff = new Date(Date.now() - retentionDays * DAY_IN_MS);
    const result = await this.repository.deleteExpired(cutoff);
    this.logger.log('Pruned expired notifications', {
      retentionDays,
      deletedCount: result.count,
    });
  }

  private buildData(notification: UserNotification) {
    const payload: Record<string, string> = {
      notificationId: notification.id,
      templateKey: notification.templateKey,
    };

    if (notification.icon) {
      payload.icon = notification.icon;
    }

    if (notification.ctaLabel) {
      payload.ctaLabel = notification.ctaLabel;
    }

    if (notification.ctaDeepLink) {
      payload.ctaDeepLink = notification.ctaDeepLink;
    }

    if (
      notification.data &&
      typeof notification.data === 'object' &&
      !Array.isArray(notification.data)
    ) {
      Object.entries(notification.data as Record<string, unknown>).forEach(
        ([key, value]) => {
          payload[`data_${key}`] =
            typeof value === 'string' ? value : JSON.stringify(value);
        },
      );
    }

    return payload;
  }
}
