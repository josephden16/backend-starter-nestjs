import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { Job } from 'bull';
import { ConfigServiceType } from 'src/config';
import { CustomLogger } from 'src/shared/logger/logger.service';

import { EMAIL_QUEUE, SendEmailDto } from './helpers';
import { ResendProvider } from './providers/resend.provider';

@Injectable()
@Processor(EMAIL_QUEUE)
export class EmailProcessor {
  private useSmtp: boolean;

  constructor(
    private readonly mailerService: MailerService,
    private readonly logger: CustomLogger,
    private readonly resendProvider: ResendProvider,
    private readonly configService: ConfigService<ConfigServiceType>,
  ) {
    this.useSmtp = this.configService.get('MAIL_SERVICE_PROVIDER') === 'smtp';
  }

  @Process()
  async process(job: Job<SendEmailDto>): Promise<void> {
    const { context, subject, template, recipient } = job.data;

    this.logger.log(
      `Processing email job ${job.id}: ${JSON.stringify({
        context,
        subject,
        template,
        recipient,
      })}`,
      'EmailProcessor',
    );

    try {
      if (this.useSmtp) {
        await this.sendWithSMTP({
          context,
          subject,
          template,
          recipient,
        });
      } else {
        await this.resendProvider.sendWithResend({
          context,
          subject,
          template,
          recipient,
        });
      }

      this.logger.log(
        `Email job ${job.id} completed successfully`,
        'EmailProcessor',
      );
    } catch (error) {
      this.logger.error(
        `Email job ${job.id} failed: ${JSON.stringify(error)}`,
        'EmailProcessor',
      );
      throw error;
    }
  }

  private async sendWithSMTP({
    context,
    subject,
    template,
    recipient,
  }: SendEmailDto) {
    const res = await this.mailerService.sendMail({
      to: recipient,
      subject,
      context,
      template,
    });

    this.logger.log(
      `Email sent via SMTP: ${JSON.stringify(res)}`,
      'EmailProcessor',
    );
  }
}
