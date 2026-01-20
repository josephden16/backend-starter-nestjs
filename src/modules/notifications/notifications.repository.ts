import { Injectable } from '@nestjs/common';
import { Prisma, UserNotification } from 'generated/prisma';
import { PrismaService } from 'src/shared/prisma/prisma.service';

import { ListNotificationsQuery, RegisterDeviceTokenInput } from './dto';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertDeviceRegistration(
    userId: string,
    input: RegisterDeviceTokenInput,
  ) {
    return this.prisma.deviceRegistration.upsert({
      where: {
        token: input.token,
      },
      create: {
        token: input.token,
        platform: input.platform,
        appVersion: input.appVersion,
        userId,
      },
      update: {
        userId,
        platform: input.platform,
        appVersion: input.appVersion,
        lastUsedAt: new Date(),
      },
    });
  }

  async createNotification(data: {
    userId: string;
    templateKey: string;
    title: string;
    body: string;
    icon?: string;
    ctaLabel?: string;
    ctaDeepLink?: string;
    data?: Record<string, unknown>;
    expiresAt?: Date;
  }) {
    return this.prisma.userNotification.create({
      data: {
        userId: data.userId,
        templateKey: data.templateKey,
        title: data.title,
        body: data.body,
        icon: data.icon,
        ctaLabel: data.ctaLabel,
        ctaDeepLink: data.ctaDeepLink,
        data: (data.data ?? null) as Prisma.JsonValue,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findNotificationById(id: string) {
    return this.prisma.userNotification.findUnique({
      where: { id },
    });
  }

  async listNotifications(userId: string, query: ListNotificationsQuery) {
    return this.prisma.userNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: query.limit,
      skip: query.offset,
    });
  }

  async countNotifications(userId: string) {
    return this.prisma.userNotification.count({
      where: { userId },
    });
  }

  async markNotifications(
    userId: string,
    params: { ids?: string[]; isRead: boolean },
  ) {
    const where: Prisma.UserNotificationWhereInput = {
      userId,
    };

    if (params.ids?.length) {
      where.id = {
        in: params.ids,
      };
    }

    return this.prisma.userNotification.updateMany({
      where,
      data: {
        isRead: params.isRead,
        readAt: params.isRead ? new Date() : null,
      },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.userNotification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async getDeviceTokens(userId: string) {
    return this.prisma.deviceRegistration.findMany({
      where: { userId },
      select: {
        token: true,
      },
    });
  }

  async deleteDeviceTokens(tokens: string[]) {
    if (!tokens.length) {
      return { count: 0 };
    }

    return this.prisma.deviceRegistration.deleteMany({
      where: {
        token: {
          in: tokens,
        },
      },
    });
  }

  async updateNotificationStatus(
    id: string,
    data: Partial<
      Pick<UserNotification, 'status' | 'sentAt' | 'failureReason'>
    >,
  ) {
    return this.prisma.userNotification.update({
      where: { id },
      data,
    });
  }

  async deleteExpired(cutoff: Date) {
    return this.prisma.userNotification.deleteMany({
      where: {
        expiresAt: {
          lt: cutoff,
        },
      },
    });
  }
}
