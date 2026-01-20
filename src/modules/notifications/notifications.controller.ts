import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'generated/prisma';
import { SWAGGER_USER_ACCESS_TOKEN } from 'src/constants';
import { AllowAuthenticated, GetUser } from 'src/shared/auth';
import { AuthenticatedUser } from 'src/shared/auth/types';
import {
  GetUnreadCountDocs,
  ListNotificationsDocs,
  MarkNotificationReadDocs,
  MarkNotificationsDocs,
  RegisterDeviceTokenDocs,
} from 'src/docs/notifications/notifications.docs';

import {
  ListNotificationsQuery,
  ListNotificationsQueryDto,
  MarkNotificationReadDto,
  MarkNotificationsDto,
  RegisterDeviceTokenDto,
} from './dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth(SWAGGER_USER_ACCESS_TOKEN)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('tokens')
  @AllowAuthenticated(UserRole.USER)
  @RegisterDeviceTokenDocs()
  registerDeviceToken(
    @Body() dto: RegisterDeviceTokenDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.notificationsService.registerDevice(user.id, dto);
  }

  @Get()
  @AllowAuthenticated(UserRole.USER)
  @ListNotificationsDocs()
  listNotifications(
    @Query() query: ListNotificationsQueryDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const params: ListNotificationsQuery = {
      limit: query.limit,
      offset: query.offset,
    };
    return this.notificationsService.listNotifications(user.id, params);
  }

  @Get('unread-count')
  @AllowAuthenticated(UserRole.USER)
  @GetUnreadCountDocs()
  getUnreadCount(@GetUser() user: AuthenticatedUser) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  @AllowAuthenticated(UserRole.USER)
  @MarkNotificationReadDocs()
  markNotification(
    @Param('id') id: string,
    @Body() body: MarkNotificationReadDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.notificationsService.markNotificationRead(
      user.id,
      id,
      body.isRead ?? true,
    );
  }

  @Patch('read')
  @AllowAuthenticated(UserRole.USER)
  @MarkNotificationsDocs()
  markNotifications(
    @Body() body: MarkNotificationsDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.notificationsService.markNotifications(user.id, {
      ids: body.ids,
      isRead: body.isRead ?? true,
    });
  }
}
