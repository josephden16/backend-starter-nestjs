import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import fs from 'fs';
import Handlebars from 'handlebars';
import { join } from 'path';
import {
  ConfigServiceType,
  EnviromentsEnum,
  MailServiceEnum,
} from 'src/config';
import { DevelopmentGuard } from 'src/guards/development.guard';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

import { EmailProcessor } from './email.processor';
import { EmailQueue } from './email.queue';
import { EmailService } from './email.service';
import { EmailTestController } from './email-test.controller';
import { EmailTestService } from './email-test.service';
import { EMAIL_QUEUE, TEMPLATE_PARTIALS } from './helpers';
import { ResendProvider } from './providers/resend.provider';

@Module({
  imports: [
    PrismaModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigServiceType>) => {
        const useSmtp =
          configService.get('MAIL_SERVICE_PROVIDER') === MailServiceEnum.SMTP;

        TEMPLATE_PARTIALS.forEach((partial) => {
          const partialPath = join(
            __dirname,
            './templates/partials',
            `${partial}.hbs`,
          );
          if (fs.existsSync(partialPath)) {
            const partialContent = fs.readFileSync(partialPath, 'utf8');
            Handlebars.registerPartial(partial, partialContent);
          }
        });

        const baseConfig = {
          template: {
            dir: join(__dirname, './templates', 'emails'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
          defaults: {
            from: `${process.env.APP_NAME || 'App'} <${configService.get('NODE_ENV') === EnviromentsEnum.Production ? configService.get('MAIL_FROM') : configService.get('RESEND_EMAIL_FROM')}>`,
          },
        };

        if (!useSmtp) {
          return {
            ...baseConfig,
            transport: {
              streamTransport: true,
              newline: 'unix',
            },
          };
        } else {
          return {
            ...baseConfig,
            preview: true,
            transport: {
              host: configService.get('MAIL_HOST'),
              port: configService.get('MAIL_PORT'),
              secure: configService.get('MAIL_SECURE'),
              auth: {
                user: configService.get('MAIL_USER'),
                pass: configService.get('MAIL_PASSWORD'),
              },
            },
          };
        }
      },
    }),
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
  ],
  controllers: [EmailTestController],
  providers: [
    EmailService,
    EmailQueue,
    EmailProcessor,
    EmailTestService,
    ResendProvider,
    DevelopmentGuard,
  ],
  exports: [EmailService, EmailTestService],
})
export class EmailModule {}
