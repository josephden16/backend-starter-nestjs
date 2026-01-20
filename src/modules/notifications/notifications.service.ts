import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationStatus } from 'generated/prisma';
import { ConfigServiceType } from 'src/config';
import { SuccessResponse } from 'src/helpers';
import { CustomLogger } from 'src/shared/logger/logger.service';

import { ListNotificationsQuery, RegisterDeviceTokenDto } from './dto';
import {
  NotificationContentPayload,
  NotificationTemplateContext,
  NotificationTemplateKey,
  resolveNotificationTemplate,
} from './notification.templates';
import { NotificationsQueue } from './notifications.queue';
import { NotificationsRepository } from './notifications.repository';

export interface CreateNotificationOptions {
  userId: string;
  templateKey: NotificationTemplateKey;
  context?: NotificationTemplateContext;
  overrides?: Partial<NotificationContentPayload>;
  data?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly retentionDays: number;

  constructor(
    private readonly repository: NotificationsRepository,
    private readonly queue: NotificationsQueue,
    private readonly configService: ConfigService<ConfigServiceType>,
    private readonly logger: CustomLogger,
  ) {
    this.retentionDays =
      this.configService.get<number>('FIREBASE_NOTIFICATIONS_RETENTION_DAYS') ??
      90;
  }

  async registerDevice(userId: string, dto: RegisterDeviceTokenDto) {
    const result = await this.repository.upsertDeviceRegistration(userId, dto);
    return SuccessResponse('Device token saved', {
      token: result.token,
      platform: result.platform,
    });
  }

  async listNotifications(userId: string, query: ListNotificationsQuery) {
    const [items, total, unreadCount] = await Promise.all([
      this.repository.listNotifications(userId, query),
      this.repository.countNotifications(userId),
      this.repository.getUnreadCount(userId),
    ]);

    return SuccessResponse('Notifications fetched', {
      items,
      meta: {
        total,
        unread: unreadCount,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < total,
      },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.repository.getUnreadCount(userId);
    return SuccessResponse('Unread count fetched', { count });
  }

  async markNotificationRead(
    userId: string,
    notificationId: string,
    isRead: boolean,
  ) {
    const notification =
      await this.repository.findNotificationById(notificationId);

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.repository.markNotifications(userId, {
      ids: [notificationId],
      isRead,
    });

    const updated = await this.repository.findNotificationById(notificationId);
    return SuccessResponse('Notification updated', updated);
  }

  async markNotifications(
    userId: string,
    params: { ids?: string[]; isRead: boolean },
  ) {
    const result = await this.repository.markNotifications(userId, params);
    return SuccessResponse('Notifications updated', {
      updated: result.count,
    });
  }

  async createNotification(options: CreateNotificationOptions) {
    const context = options.context ?? {};
    const basePayload = resolveNotificationTemplate(
      options.templateKey,
      context,
    );

    const payload: NotificationContentPayload = {
      ...basePayload,
      ...options.overrides,
    };

    const expiresAt = new Date(
      Date.now() + this.retentionDays * 24 * 60 * 60 * 1000,
    );

    const notification = await this.repository.createNotification({
      userId: options.userId,
      templateKey: options.templateKey,
      title: payload.title,
      body: payload.body,
      icon: payload.icon,
      ctaLabel: payload.ctaLabel,
      ctaDeepLink: payload.ctaDeepLink,
      data: options.data ?? payload.data,
      expiresAt,
    });

    if (notification.status === NotificationStatus.PENDING) {
      await this.queue.enqueueSendNotification(notification.id);
    }

    this.logger.log('Notification created', {
      userId: options.userId,
      templateKey: options.templateKey,
      notificationId: notification.id,
    });

    return notification;
  }
}
