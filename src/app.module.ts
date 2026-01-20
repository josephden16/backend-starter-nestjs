import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigServiceType } from './config';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ApiLoggerMiddleware } from './middlewares/api-logger.middleware';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminAuthGuard } from './shared/auth/admin-auth.guard';
import { AuthGuard } from './shared/auth/auth.guard';
import { EmailModule } from './shared/emails/email.module';
import { LoggerModule } from './shared/logger/logger.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { SecurityModule } from './shared/security';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [], isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<ConfigServiceType>) => {
        const redisPort = configService.get<number>('REDIS_PORT');
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPassword = configService.get<string>('REDIS_PASSWORD');
        return {
          redis: {
            host: redisHost || 'localhost',
            port: redisPort,
            password: redisPassword || '',
          },
        };
      },
      inject: [ConfigService],
    }),
    JwtModule.register({
      global: true,
    }),
    LoggerModule,
    SecurityModule,
    ScheduleModule.forRoot(),
    PrismaModule,
    EmailModule,
    NotificationsModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthGuard,
    AdminAuthGuard,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ApiLoggerMiddleware).forRoutes('*path');
  }
}
